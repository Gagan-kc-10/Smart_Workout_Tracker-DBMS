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
-- Table structure for table `trainer_assignment`
--

DROP TABLE IF EXISTS `trainer_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_assignment` (
  `Assignment_ID` int NOT NULL AUTO_INCREMENT,
  `Trainer_ID` int NOT NULL,
  `User_ID` int NOT NULL,
  `Assigned_Date` date NOT NULL,
  `Assignment_Status` varchar(30) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`Assignment_ID`),
  UNIQUE KEY `uq_trainer_user` (`Trainer_ID`,`User_ID`),
  KEY `fk_assignment_user` (`User_ID`),
  CONSTRAINT `fk_assignment_trainer` FOREIGN KEY (`Trainer_ID`) REFERENCES `user` (`User_ID`),
  CONSTRAINT `fk_assignment_user` FOREIGN KEY (`User_ID`) REFERENCES `user` (`User_ID`),
  CONSTRAINT `chk_different_users` CHECK ((`Trainer_ID` <> `User_ID`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainer_assignment`
--

LOCK TABLES `trainer_assignment` WRITE;
/*!40000 ALTER TABLE `trainer_assignment` DISABLE KEYS */;
INSERT INTO `trainer_assignment` VALUES (1,14,1,'2026-11-05','Active'),(2,15,2,'2026-11-17','Active'),(3,15,3,'2026-11-17','Active'),(4,15,8,'2026-11-17','Active'),(5,14,4,'2026-11-17','Active'),(6,14,7,'2026-11-17','Active');
/*!40000 ALTER TABLE `trainer_assignment` ENABLE KEYS */;
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
