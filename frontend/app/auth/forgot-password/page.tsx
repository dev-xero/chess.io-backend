'use client';

import Error from '@/components/ui/Error';
import FilledButton from '@/components/ui/FilledButton';
import InputField from '@/components/ui/InputField';
import Link from '@/components/ui/Link';
import Marker from '@/components/ui/Marker';
import Success from '@/components/ui/Success';
import config from '@/config/config';
import NetworkConfig from '@/config/http';
import CenteredGrid from '@/layout/CenteredGrid';
import { ErrorResponse } from '@/util/error';
import { Asterisk, Horse, Lock } from '@phosphor-icons/react';
import axios, { AxiosError } from 'axios';
import { FormEvent, useState } from 'react';

export default function Page() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);
    const [userName, setUserName] = useState('');
    const [secretQuestion, setSecretQuestion] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const refreshForm = () => {
        setError('');
        setSuccess('');
        setIsDisabled(true);
    };

    const displayError = (msg: string) => {
        setError(msg);
        setIsDisabled(false);
    };

    const handlePasswordReset = async (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        refreshForm();

        if (
            userName.trim().length == 0 ||
            newPassword.trim().length == 0 ||
            secretQuestion.trim().length == 0
        ) {
            displayError('Please fill all fields.');
            return;
        }

        if (newPassword.length < 8) {
            displayError('New password cannot be less than 8 characters.');
            return;
        }

        if (secretQuestion.length < 8) {
            displayError('Secret question cannot be less than 8 characters.');
            return;
        }

        // attempt to reset password
        try {
            const { data } = await axios.post(
                `${config.api}/auth/reset-password`,
                {
                    username: userName,
                    newPassword: newPassword,
                    secretQuestion: secretQuestion,
                },
                NetworkConfig
            );

            console.log(data);
            localStorage.clear();
            setSuccess(data.message);
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 500);
        } catch (err) {
            console.error(err);
            const axiosError = err as AxiosError;
            if (axiosError.response) {
                console.warn(axiosError.response);
                const error =
                    ((err as AxiosError).response?.data as ErrorResponse)?.[
                        'error'
                    ] ?? 'An unknown error occurred.';
                displayError(error);
            } else {
                displayError('An unknown error occurred.');
            }
        } finally {
            setIsDisabled(false);
        }
    };

    return (
        <CenteredGrid>
            <section className="w-screen md:w-[512px] max-w-lg flex flex-col items-center py-2 px-4 relative">
                <Marker />
                <section className="text-center flex flex-col mt-8">
                    <h2 className="font-bold mb-2 text-2xl">Forgot Password</h2>
                    <p className="text-faded">
                        We need your secret question to make sure it&apos;s you.
                    </p>
                </section>
                <form
                    action="/"
                    onSubmit={handlePasswordReset}
                    className="w-full md:max-w-[512px] md:w-[512px]"
                >
                    <section className="my-8 flex flex-col gap-2">
                        <InputField
                            name="username-field"
                            icon={<Horse size={24} />}
                            placeholder="Username"
                            text={userName}
                            onChange={(val) => setUserName(val)}
                            type="text"
                        />
                        <InputField
                            name="secret-field"
                            icon={<Asterisk size={24} />}
                            placeholder="Secret question"
                            text={secretQuestion}
                            onChange={(val) => setSecretQuestion(val)}
                            type="text"
                        />
                        <InputField
                            name="password-field"
                            icon={<Lock size={24} />}
                            placeholder="New password"
                            text={newPassword}
                            onChange={(val) => setNewPassword(val)}
                            type="password"
                        />
                    </section>
                    <Error err={error} />
                    <Success msg={success} />
                    <FilledButton
                        label="Reset"
                        isDisabled={isDisabled}
                        pendingText="Hang On"
                        onClick={() => handlePasswordReset}
                    />
                    <section className="mt-4 flex items-center justify-center gap-4">
                        <Link
                            href="/auth/login"
                            label="Login Instead"
                            external={false}
                        />
                    </section>
                </form>
            </section>
        </CenteredGrid>
    );
}
