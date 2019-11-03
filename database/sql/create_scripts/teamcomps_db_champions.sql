USE teamcomps_db;
CREATE TABLE `champions` (
   `PrimeKey` bigint(20) NOT NULL COMMENT 'Prime number associated with champion. See <rootfolder>/teamcomps/python/assets/champions.json for source information.',
   `RiotKey` bigint(20) DEFAULT NULL,
   `Name` varchar(75) DEFAULT NULL,
   PRIMARY KEY (`PrimeKey`),
   UNIQUE KEY `RiotKey_UNIQUE` (`RiotKey`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='This tables stores the definition information for a champion. This currently includes champion name, the key (Riot''s identifier), and the prime key identifier used by teamcomps.'