USE teamcomps_db;
CREATE TABLE `winlosseventfact` (
   `TeamComboKey` bigint(20) NOT NULL COMMENT 'This is the prime product of each ',
   `ChampOne` bigint(20) DEFAULT NULL,
   `ChampTwo` bigint(20) DEFAULT NULL,
   `ChampThree` bigint(20) DEFAULT NULL,
   `ChampFour` bigint(20) DEFAULT NULL,
   `ChampFive` bigint(20) DEFAULT NULL,
   `IsWin` bit(1) DEFAULT NULL,
   `MatchId` bigint(20) DEFAULT NULL COMMENT 'Riot match identifier',
   `TimeOfEntry` datetime DEFAULT NULL,
   `Patch` varchar(75) DEFAULT NULL,
   PRIMARY KEY (`TeamComboKey`),
   KEY `Champion1_idx` (`ChampOne`),
   KEY `Champion2_idx` (`ChampTwo`),
   KEY `Champion3_idx` (`ChampThree`),
   KEY `Champion4_idx` (`ChampFour`),
   KEY `Champion5_idx` (`ChampFive`),
   CONSTRAINT `Champion1` FOREIGN KEY (`ChampOne`) REFERENCES `champions` (`RiotKey`),
   CONSTRAINT `Champion2` FOREIGN KEY (`ChampTwo`) REFERENCES `champions` (`RiotKey`),
   CONSTRAINT `Champion3` FOREIGN KEY (`ChampThree`) REFERENCES `champions` (`RiotKey`),
   CONSTRAINT `Champion4` FOREIGN KEY (`ChampFour`) REFERENCES `champions` (`RiotKey`),
   CONSTRAINT `Champion5` FOREIGN KEY (`ChampFive`) REFERENCES `champions` (`RiotKey`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='This table stores each win/loss for a team'