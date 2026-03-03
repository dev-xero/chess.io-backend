-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStats" (
    "statID" TEXT NOT NULL,
    "playerID" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "gamesPlayed" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,

    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("statID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStats_playerID_key" ON "PlayerStats"("playerID");

-- AddForeignKey
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_playerID_fkey" FOREIGN KEY ("playerID") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
