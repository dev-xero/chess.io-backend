'use client';

import FilledButton from '@/components/ui/FilledButton';
import ChessIO from '@/components/ChessIO';
import InputField from '@/components/ui/InputField';
import Error from '@/components/ui/Error';
import Link from '@/components/ui/Link';
import Marker from '@/components/ui/Marker';
import CenteredGrid from '@/layout/CenteredGrid';
import { Horse, Lock } from '@phosphor-icons/react';
import { FormEvent, useState } from 'react';
import axios, { AxiosError } from 'axios';
import config from '@/config/config';
import NetworkConfig from '@/config/http';
import { ErrorResponse } from '@/util/error';
import { setCookie } from 'cookies-next';
import { keys } from '@/config/keys';
import { inOneHour } from '@/util/date';

export default function Page() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    const refreshForm = () => {
        setError('');
        setIsDisabled(true);
    };

    const displayError = (msg: string) => {
        setError(msg);
        setIsDisabled(false);
    };

    const handleUserLogin = async (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        refreshForm();

        if (userName.trim().length == 0 || password.trim().length == 0) {
            displayError('Please fill all fields.');
            return;
        }

        if (password.length < 8) {
            displayError('Password cannot be less than 8 characters.');
            return;
        }
        try {
            const { data } = await axios.post(
                `${config.api}/auth/login`,
                {
                    username: userName,
                    password: password,
                },
                NetworkConfig
            );

            const { payload } = data;
            setCookie(keys.auth, payload.auth.token, {
                expires: inOneHour(),
            });
            localStorage.setItem(keys.user, JSON.stringify(payload.user));
            window.location.href = '/';
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
                <ChessIO />
                <section className="text-center flex flex-col mt-8">
                    <h2 className="font-bold mb-2 text-2xl">Welcome Back</h2>
                    <p className="text-faded">
                        Log back into your account to play friends!
                    </p>
                </section>
                <form
                    action="/"
                    onSubmit={handleUserLogin}
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
                            name="password-field"
                            icon={<Lock size={24} />}
                            placeholder="Password"
                            text={password}
                            onChange={(val) => setPassword(val)}
                            type="password"
                        />
                    </section>
                    <Error err={error} />
                    <FilledButton
                        label="Log In"
                        isDisabled={isDisabled}
                        pendingText="Logging In"
                        onClick={() => handleUserLogin}
                    />
                    <section className="mt-4 flex items-center justify-center gap-4">
                        <Link
                            href="/auth/register"
                            label="Register Instead"
                            external={false}
                        />
                        <Link
                            href="/auth/forgot-password"
                            label="Forgot Password"
                            external={false}
                        />
                    </section>
                </form>
            </section>
        </CenteredGrid>
    );
}
