-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_workout_tracker
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `fitness_progress`
--

DROP TABLE IF EXISTS `fitness_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fitness_progress` (
  `Progress_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int NOT NULL,
  `Record_Date` date NOT NULL,
  `Weight` decimal(5,2) NOT NULL,
  `Body_Fat_Percentage` decimal(5,2) DEFAULT NULL,
  `Stamina_Minutes` decimal(6,2) DEFAULT NULL,
  `Fitness_Notes` text,
  PRIMARY KEY (`Progress_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `fitness_progress_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fitness_progress`
--

LOCK TABLES `fitness_progress` WRITE;
/*!40000 ALTER TABLE `fitness_progress` DISABLE KEYS */;
INSERT INTO `fitness_progress` VALUES (1,1,'2026-10-29',72.50,20.00,NULL,'Intermediate fitness; starting weight-loss tracking'),(2,2,'2026-10-29',58.00,24.00,NULL,'Beginner fitness; starting weight-gain tracking'),(3,3,'2026-10-29',55.00,25.00,15.00,'Beginner; working on stamina'),(4,4,'2026-10-29',68.00,22.00,NULL,'Beginner; starting weight-loss plan'),(5,5,'2026-10-29',76.00,18.00,NULL,'Intermediate; muscle-building goal'),(6,6,'2026-10-29',60.00,23.00,20.00,'Intermediate; stamina improvement'),(7,7,'2026-10-29',82.00,19.00,NULL,'Intermediate; muscle-building goal'),(8,8,'2026-10-29',62.00,24.00,NULL,'Advanced; maintaining fitness'),(9,9,'2026-10-29',85.00,17.00,NULL,'Advanced; muscle-building goal'),(10,10,'2026-10-29',59.00,22.00,25.00,'Advanced; stamina improvement'),(11,1,'2026-11-01',71.00,NULL,NULL,'Test measurement for fitness goal progress');
/*!40000 ALTER TABLE `fitness_progress` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 15:52:45
