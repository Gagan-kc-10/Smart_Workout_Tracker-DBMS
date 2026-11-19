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
-- Table structure for table `workout_plan`
--

DROP TABLE IF EXISTS `workout_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_plan` (
  `Plan_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int NOT NULL,
  `Plan_Name` varchar(120) NOT NULL,
  `Plan_Type` varchar(60) NOT NULL,
  `Start_Date` date NOT NULL,
  `End_Date` date DEFAULT NULL,
  `Plan_Status` varchar(30) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`Plan_ID`),
  UNIQUE KEY `uq_workout_plan_id_user` (`Plan_ID`,`User_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `workout_plan_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_plan`
--

LOCK TABLES `workout_plan` WRITE;
/*!40000 ALTER TABLE `workout_plan` DISABLE KEYS */;
INSERT INTO `workout_plan` VALUES (1,1,'Rahul Strength and Conditioning Plan','Strength','2026-10-28','2026-12-30','Active'),(2,2,'Priya Beginner Fitness','Weight Gain','2026-10-29','2027-01-31','Active'),(3,3,'Ananya Stamina Starter','Cardio','2026-10-29','2026-12-31','Active'),(4,4,'Kiran Weight Management','Weight Loss','2026-10-29','2027-01-31','Active'),(5,5,'Arjun Muscle Builder','Strength','2026-10-29','2027-03-31','Active'),(6,6,'Sneha Cardio Progress','Cardio','2026-10-29','2027-01-31','Active'),(7,7,'Vikram Advanced Strength','Strength','2026-10-29','2027-03-31','Active'),(8,8,'Meera Fitness Maintenance','Maintenance','2026-10-29','2027-03-31','Active'),(9,9,'Aditya Advanced Muscle','Strength','2026-10-29','2027-03-31','Active'),(10,10,'Divya Endurance Builder','Cardio','2026-10-29','2027-01-31','Active'),(11,1,'Rahul Advanced Muscle Building Plan','Strength','2026-11-06','2026-12-31','Active');
/*!40000 ALTER TABLE `workout_plan` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 15:52:46
