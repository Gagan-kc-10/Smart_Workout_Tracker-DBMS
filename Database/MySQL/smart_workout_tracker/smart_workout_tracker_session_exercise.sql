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
-- Table structure for table `session_exercise`
--

DROP TABLE IF EXISTS `session_exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_exercise` (
  `Session_Exercise_ID` int NOT NULL AUTO_INCREMENT,
  `Session_ID` int NOT NULL,
  `Exercise_ID` int NOT NULL,
  `Sets_Completed` smallint unsigned NOT NULL DEFAULT '0',
  `Reps_Completed` smallint unsigned NOT NULL DEFAULT '0',
  `Weight_Used` decimal(7,2) DEFAULT NULL,
  `Duration` int unsigned DEFAULT NULL,
  `Calories_Estimated` decimal(7,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`Session_Exercise_ID`),
  KEY `Session_ID` (`Session_ID`),
  KEY `Exercise_ID` (`Exercise_ID`),
  CONSTRAINT `session_exercise_ibfk_1` FOREIGN KEY (`Session_ID`) REFERENCES `workout_session` (`Session_ID`),
  CONSTRAINT `session_exercise_ibfk_2` FOREIGN KEY (`Exercise_ID`) REFERENCES `exercise` (`Exercise_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_exercise`
--

LOCK TABLES `session_exercise` WRITE;
/*!40000 ALTER TABLE `session_exercise` DISABLE KEYS */;
INSERT INTO `session_exercise` VALUES (1,1,5,4,10,20.00,15,0.00),(2,1,8,3,8,40.00,20,0.00),(3,2,2,3,12,NULL,15,0.00),(4,2,5,3,10,5.00,15,0.00),(5,3,4,1,20,NULL,20,0.00),(6,3,3,3,30,NULL,5,0.00),(7,4,2,3,12,NULL,15,0.00),(8,4,6,3,10,NULL,15,0.00),(9,5,5,4,10,25.00,20,0.00),(10,5,8,4,8,50.00,25,0.00),(11,6,9,1,30,NULL,30,0.00),(12,6,4,1,20,NULL,20,0.00),(13,7,7,4,8,NULL,15,0.00),(14,7,8,4,8,60.00,25,0.00),(15,8,1,3,12,NULL,10,0.00),(16,8,3,3,30,NULL,5,0.00),(17,9,5,4,10,30.00,20,0.00),(18,9,7,4,8,NULL,15,0.00),(19,10,4,1,25,NULL,25,0.00),(20,10,10,3,12,NULL,15,0.00),(21,13,1,3,12,40.00,600,0.00),(22,14,1,3,12,0.00,600,0.00),(23,23,5,4,10,76.00,1800,0.00),(24,23,8,3,8,68.00,1200,0.00),(25,25,5,4,10,62.00,1800,0.00),(26,25,8,3,8,56.00,1500,0.00),(27,26,5,4,10,63.00,1800,0.00),(28,26,8,3,8,56.00,1200,0.00),(29,27,5,4,10,NULL,NULL,0.00),(30,27,8,3,8,NULL,NULL,0.00),(31,30,5,4,10,67.00,1920,0.00),(32,30,8,3,10,58.00,1800,0.00),(33,31,5,4,10,56.00,1800,0.00),(34,31,8,3,8,52.00,1200,0.00),(35,31,5,4,10,63.00,1800,0.00),(36,31,8,3,8,56.00,1380,0.00),(37,32,8,3,8,57.00,1500,0.00),(38,32,5,4,10,45.00,1800,0.00),(39,33,8,3,8,56.00,600,0.00),(40,33,8,3,8,56.00,600,0.00),(41,33,5,4,10,63.00,1200,0.00),(42,34,8,3,8,56.00,600,0.00),(43,34,5,4,10,62.00,1200,0.00),(44,34,5,4,10,56.00,1200,0.00),(45,34,8,3,8,52.00,600,0.00),(46,35,5,4,10,56.00,1200,0.00),(47,35,8,3,8,53.00,600,0.00),(48,36,8,3,8,56.00,600,0.00),(49,36,8,3,8,54.00,600,0.00),(50,36,5,4,10,65.00,1200,0.00),(51,38,9,2,15,NULL,300,25.00);
/*!40000 ALTER TABLE `session_exercise` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_update_session_calories` AFTER INSERT ON `session_exercise` FOR EACH ROW BEGIN
    UPDATE workout_session
    SET Calories_Burned = (
        SELECT COALESCE(SUM(Calories_Estimated), 0)
        FROM session_exercise
        WHERE Session_ID = NEW.Session_ID
    )
    WHERE Session_ID = NEW.Session_ID;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 15:52:44
