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
-- Table structure for table `plan_exercise`
--

DROP TABLE IF EXISTS `plan_exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_exercise` (
  `Plan_Exercise_ID` int NOT NULL AUTO_INCREMENT,
  `Plan_ID` int NOT NULL,
  `Exercise_ID` int NOT NULL,
  `Target_Sets` smallint unsigned NOT NULL,
  `Target_Reps` smallint unsigned NOT NULL,
  `Day_Number` tinyint unsigned NOT NULL,
  PRIMARY KEY (`Plan_Exercise_ID`),
  KEY `Plan_ID` (`Plan_ID`),
  KEY `Exercise_ID` (`Exercise_ID`),
  CONSTRAINT `plan_exercise_ibfk_1` FOREIGN KEY (`Plan_ID`) REFERENCES `workout_plan` (`Plan_ID`),
  CONSTRAINT `plan_exercise_ibfk_2` FOREIGN KEY (`Exercise_ID`) REFERENCES `exercise` (`Exercise_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_exercise`
--

LOCK TABLES `plan_exercise` WRITE;
/*!40000 ALTER TABLE `plan_exercise` DISABLE KEYS */;
INSERT INTO `plan_exercise` VALUES (1,1,5,4,10,1),(2,1,8,3,8,2),(3,2,2,3,12,1),(4,2,5,3,10,2),(5,3,4,1,20,1),(6,3,3,3,30,2),(7,4,2,3,12,1),(8,4,6,3,10,2),(9,5,5,4,10,1),(10,5,8,4,8,2),(11,6,9,1,30,1),(12,6,4,1,20,2),(13,7,7,4,8,1),(14,7,8,4,8,2),(15,8,1,3,12,1),(16,8,3,3,30,2),(17,9,5,4,10,1),(18,9,7,4,8,2),(19,10,4,1,25,1),(20,10,10,3,12,2),(21,11,1,3,12,1),(22,11,2,3,15,1),(23,11,5,4,10,2),(24,11,7,3,8,2);
/*!40000 ALTER TABLE `plan_exercise` ENABLE KEYS */;
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
