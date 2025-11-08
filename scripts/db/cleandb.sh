echo "Irreversible action - clearing db"

yarn prisma db push --force-reset && yarn prisma db push
