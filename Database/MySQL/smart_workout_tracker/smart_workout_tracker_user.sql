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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `User_ID` int NOT NULL AUTO_INCREMENT,
  `First_Name` varchar(60) NOT NULL,
  `Last_Name` varchar(60) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password_Hash` varchar(255) NOT NULL,
  `Date_of_Birth` date DEFAULT NULL,
  `Gender` varchar(30) DEFAULT NULL,
  `Height` decimal(5,2) DEFAULT NULL,
  `Weight` decimal(5,2) DEFAULT NULL,
  `Fitness_Level` varchar(30) DEFAULT NULL,
  `Role_ID` int NOT NULL DEFAULT '2',
  `Trainer_Approval_Status` enum('Pending','Approved','Rejected') DEFAULT NULL,
  PRIMARY KEY (`User_ID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `fk_user_role` (`Role_ID`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`Role_ID`) REFERENCES `role` (`Role_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Rahul','Sharma','rahul@example.com','$2b$10$QVbUPrTMP/WlRcJEJI2pKO61DxHEW5Aff7BrXhqR8RMTfC90y2DZa','2004-05-15','Male',175.00,72.50,'Intermediate',2,NULL),(2,'Priya','Reddy','priya@example.com','demo_hash_priya','2005-08-22','Female',162.00,58.00,'Beginner',2,NULL),(3,'Ananya','Rao','ananya@example.com','demo_hash_ananya','2005-03-12','Female',160.00,55.00,'Beginner',2,NULL),(4,'Kiran','Kumar','kiran@example.com','demo_hash_kiran','2004-11-20','Male',170.00,68.00,'Beginner',2,NULL),(5,'Arjun','Patel','arjun@example.com','demo_hash_arjun','2003-07-08','Male',178.00,76.00,'Intermediate',2,NULL),(6,'Sneha','Nair','sneha@example.com','$2b$12$ZV0nmbDXwuBiL5VMwSAtD.3te7Lui/LQRdOVhBZImihCkkNW7Yc6e','2004-02-18','Female',165.00,60.00,'Intermediate',2,NULL),(7,'Vikram','Reddy','vikram@example.com','demo_hash_vikram','2003-09-25','Male',180.00,82.00,'Intermediate',2,NULL),(8,'Meera','Shah','meera@example.com','demo_hash_meera','2002-06-14','Female',168.00,62.00,'Advanced',2,NULL),(9,'Aditya','Verma','aditya@example.com','demo_hash_aditya','2001-12-05','Male',182.00,85.00,'Advanced',2,NULL),(10,'Divya','Menon','divya@example.com','demo_hash_divya','2002-04-22','Female',164.00,59.00,'Advanced',2,NULL),(11,'Test','User','testuser@example.com','$2b$12$1Odu9Ziy.ydyBwAlPq6HkeWFpRH2/mdnURMWhrF0D2yO7A.FpV8m6','2004-06-15','Male',175.00,70.00,'Intermediate',2,NULL),(12,'Demo','Student','demostudent@example.com','$2b$12$X7v/y/hsm56yHgPK4/3xDehL79xtJh9JXk6892nselCx.a6bvJOde','2026-11-01','Male',176.00,70.00,'Intermediate',2,NULL),(13,'Arjun','Mehta','arjun.mehta@smartworkout.com','$2b$10$xJT7dIvB69lPDhtcHwrUiO9kmotnlaECzMYCtPkh93dPBE9yKllpK',NULL,NULL,NULL,NULL,NULL,3,NULL),(14,'Arun','Kumar','arun.trainer@smartworkout.com','$2b$12$szUv06ku8iDxMoZBxQJnEOhMg2Qu/VQyg6SUjL9aJH4xJR24o.Ppm',NULL,'Male',NULL,NULL,NULL,1,'Approved'),(15,'Nisha','Sharma','nisha.sharma@fittrack.com','$2b$12$SD/kVB/98FmY3dy9cfTLWutYYUfKmTQZdRxuu7nxj.vdXGlOioOue','1995-06-15','Female',NULL,NULL,NULL,1,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 15:52:44
