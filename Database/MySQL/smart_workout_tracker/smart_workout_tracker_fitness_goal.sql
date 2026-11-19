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
-- Table structure for table `fitness_goal`
--

DROP TABLE IF EXISTS `fitness_goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fitness_goal` (
  `Goal_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int NOT NULL,
  `Goal_Type` varchar(80) NOT NULL,
  `Target_Value` decimal(10,2) NOT NULL,
  `Target_Unit` varchar(30) NOT NULL DEFAULT 'Not Specified',
  `Start_Date` date NOT NULL,
  `Target_Date` date NOT NULL,
  `Goal_Status` varchar(30) NOT NULL DEFAULT 'In Progress',
  PRIMARY KEY (`Goal_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `fitness_goal_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fitness_goal`
--

LOCK TABLES `fitness_goal` WRITE;
/*!40000 ALTER TABLE `fitness_goal` DISABLE KEYS */;
INSERT INTO `fitness_goal` VALUES (1,1,'Weight Loss',68.00,'kg','2026-10-01','2026-12-31','In Progress'),(2,2,'Weight Gain',62.00,'kg','2026-10-01','2027-01-31','In Progress'),(3,3,'Improve Stamina',30.00,'minutes','2026-10-01','2026-12-31','In Progress'),(4,4,'Weight Loss',64.00,'kg','2026-10-01','2027-01-31','In Progress'),(5,5,'Build Muscle',80.00,'kg','2026-10-01','2027-03-31','In Progress'),(6,6,'Improve Stamina',45.00,'minutes','2026-10-01','2027-01-31','In Progress'),(7,7,'Build Muscle',85.00,'kg','2026-10-01','2027-03-31','In Progress'),(8,8,'Maintain Fitness',62.00,'kg','2026-10-01','2027-03-31','In Progress'),(9,9,'Build Muscle',88.00,'kg','2026-10-01','2027-03-31','In Progress'),(10,10,'Improve Stamina',50.00,'minutes','2026-10-01','2027-01-31','In Progress');
/*!40000 ALTER TABLE `fitness_goal` ENABLE KEYS */;
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
