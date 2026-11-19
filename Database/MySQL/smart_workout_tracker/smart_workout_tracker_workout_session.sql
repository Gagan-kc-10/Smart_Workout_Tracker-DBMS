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
-- Table structure for table `workout_session`
--

DROP TABLE IF EXISTS `workout_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_session` (
  `Session_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int NOT NULL,
  `Plan_ID` int DEFAULT NULL,
  `Session_Date` date NOT NULL,
  `Start_Time` time NOT NULL,
  `End_Time` time DEFAULT NULL,
  `Calories_Burned` decimal(8,2) DEFAULT NULL,
  `Session_Status` varchar(30) NOT NULL DEFAULT 'Planned',
  PRIMARY KEY (`Session_ID`),
  KEY `User_ID` (`User_ID`),
  KEY `fk_session_plan_user` (`Plan_ID`,`User_ID`),
  CONSTRAINT `fk_session_plan_user` FOREIGN KEY (`Plan_ID`, `User_ID`) REFERENCES `workout_plan` (`Plan_ID`, `User_ID`),
  CONSTRAINT `workout_session_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_session`
--

LOCK TABLES `workout_session` WRITE;
/*!40000 ALTER TABLE `workout_session` DISABLE KEYS */;
INSERT INTO `workout_session` VALUES (1,1,1,'2026-10-29','06:00:00','07:00:00',350.00,'Completed'),(2,2,2,'2026-10-29','07:00:00','07:45:00',220.00,'Completed'),(3,3,3,'2026-10-29','06:30:00','07:00:00',180.00,'Completed'),(4,4,4,'2026-10-29','17:00:00','17:45:00',250.00,'Completed'),(5,5,5,'2026-10-29','18:00:00','19:00:00',400.00,'Completed'),(6,6,6,'2026-10-29','07:30:00','08:15:00',280.00,'Completed'),(7,7,7,'2026-10-29','18:30:00','19:30:00',420.00,'Completed'),(8,8,8,'2026-10-29','06:00:00','06:45:00',230.00,'Completed'),(9,9,9,'2026-10-29','17:30:00','18:30:00',450.00,'Completed'),(10,10,10,'2026-10-29','07:00:00','07:50:00',300.00,'Completed'),(11,1,1,'2026-10-30','11:47:21','11:49:24',250.00,'Completed'),(12,1,1,'2026-10-30','12:04:52','12:07:57',300.00,'Completed'),(13,1,1,'2026-10-31','09:19:37','09:25:31',300.00,'Completed'),(14,1,1,'2026-11-01','10:43:00','10:45:39',250.00,'Completed'),(15,1,1,'2026-11-01','11:32:55',NULL,NULL,'In Progress'),(16,1,1,'2026-11-01','11:58:44',NULL,NULL,'In Progress'),(17,1,1,'2026-11-01','11:58:54',NULL,NULL,'In Progress'),(18,1,1,'2026-11-01','12:01:56',NULL,NULL,'In Progress'),(19,1,1,'2026-11-01','12:02:01',NULL,NULL,'In Progress'),(20,1,1,'2026-11-01','12:02:48',NULL,NULL,'In Progress'),(21,1,1,'2026-11-01','12:34:32',NULL,NULL,'In Progress'),(22,1,1,'2026-11-01','12:41:00',NULL,NULL,'In Progress'),(23,1,1,'2026-11-01','12:42:40','12:44:17',863.00,'Completed'),(24,1,1,'2026-11-01','12:58:24',NULL,NULL,'In Progress'),(25,1,1,'2026-11-01','13:15:33','13:16:21',450.00,'Completed'),(26,1,1,'2026-11-01','13:24:01','13:24:26',0.00,'Completed'),(27,1,1,'2026-11-01','13:28:24',NULL,NULL,'In Progress'),(28,1,1,'2026-11-01','13:28:40',NULL,NULL,'In Progress'),(29,1,1,'2026-11-01','13:30:32',NULL,NULL,'In Progress'),(30,1,1,'2026-11-01','13:47:46','13:48:36',530.00,'Completed'),(31,1,1,'2026-11-01','14:25:35',NULL,NULL,'In Progress'),(32,1,1,'2026-11-01','14:34:31','14:35:28',0.00,'Completed'),(33,1,1,'2026-11-01','14:35:39','14:45:39',0.00,'Completed'),(34,1,1,'2026-11-01','14:45:46','14:55:59',0.00,'Completed'),(35,1,1,'2026-11-01','14:56:10','14:58:30',0.00,'Completed'),(36,1,1,'2026-11-01','14:58:38','15:03:09',0.00,'Completed'),(37,6,6,'2026-11-17','22:48:59',NULL,NULL,'In Progress'),(38,6,6,'2026-11-19','14:39:07',NULL,25.00,'In Progress');
/*!40000 ALTER TABLE `workout_session` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 15:52:43
