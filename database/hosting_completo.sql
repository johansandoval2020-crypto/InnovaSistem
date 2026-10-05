-- InnovaSistem: base completa para importar en el hosting (InfinityFree u otro).
-- Importar en phpMyAdmin DENTRO de la base que creaste en el panel del hosting.
-- Estado: movimientos en cero (ventas, pagos, pedidos y stock en 0).


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(50) NOT NULL,
  `id_negocio` int(11) NOT NULL,
  PRIMARY KEY (`id_categoria`),
  KEY `id_negocio` (`id_negocio`),
  CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Pupusas',1),(2,'Bebidas',1),(3,'Postres',1),(4,'Repuestos',4),(5,'Servicios Mecanicos',4),(6,'Llantas',4),(7,'Consultas',7),(8,'Medicamentos',7),(9,'Laboratorio',7),(10,'Emergencias',7),(12,'Salud y medicina',13);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `id_negocio` int(11) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_cliente`),
  KEY `fk_clientes_negocio` (`id_negocio`),
  CONSTRAINT `fk_clientes_negocio` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Carlos Ramirez','7111-1111','Col. San Jose',1,NULL,1),(2,'Lucia Fernandez','7222-2222','Col. Escalon',4,NULL,1),(3,'Roberto Diaz','7333-3333','Col. Miramonte',7,NULL,1),(4,'Andrea Solano','7444-4444','Col. Layco',1,NULL,1),(5,'Jose Hernandez','7555-5555','Col. Flor Blanca',4,NULL,1),(6,'Marta Villalobos','7666-6666','Col. Centroamerica',7,NULL,1),(7,'Diego Portillo','7777-7777','Col. San Benito',2,NULL,1),(8,'Gabriela Rivas','7888-8888','Col. Universitaria',5,NULL,1),(9,'Manuel Bonilla','7999-9999','Col. Satelite',8,NULL,1),(10,'Elena Guardado','7100-1010','Col. Zacamil',4,NULL,1);
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_pedido` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `detalle_pedido` WRITE;
/*!40000 ALTER TABLE `detalle_pedido` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_pedido` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_venta` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facturas` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `fecha_emision` date NOT NULL,
  `total_factura` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_venta` (`id_venta`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `inventario_movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventario_movimientos` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `tipo_movimiento` varchar(10) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `inventario_movimientos_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `inventario_movimientos` WRITE;
/*!40000 ALTER TABLE `inventario_movimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario_movimientos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `negocios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `negocios` (
  `id_negocio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_negocio`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `negocios` WRITE;
/*!40000 ALTER TABLE `negocios` DISABLE KEYS */;
INSERT INTO `negocios` VALUES (1,'Pupuseria Doña Chayo - Centro','Comida','Local 1, Centro Comercial','7000-1111','2026-10-05 12:02:53'),(2,'Pupuseria Doña Chayo - Norte','Comida','Local 7, Plaza Norte','7000-1112','2026-10-05 12:02:53'),(3,'Pupuseria Doña Chayo - Oeste','Comida','Local 12, Plaza Oeste','7000-1113','2026-10-05 12:02:53'),(4,'Taller Don Natalio - Centro','Taller Mecanico','Local 2, Centro Comercial','7000-2222','2026-10-05 12:02:53'),(5,'Taller Don Natalio - Sur','Taller Mecanico','Local 9, Plaza Sur','7000-2223','2026-10-05 12:02:53'),(6,'Taller Don Natalio - Este','Taller Mecanico','Local 15, Plaza Este','7000-2224','2026-10-05 12:02:53'),(7,'Clinica El Pirilin - Centro','Salud','Local 3, Centro Comercial','7000-3333','2026-10-05 12:02:53'),(8,'Clinica El Pirilin - Norte','Salud','Local 8, Plaza Norte','7000-3334','2026-10-05 12:02:53'),(9,'Clinica El Pirilin - Sur','Salud','Local 11, Plaza Sur','7000-3335','2026-10-05 12:02:53'),(10,'Clinica El Pirilin - Este','Salud','Local 16, Plaza Este','7000-3336','2026-10-05 12:02:53'),(12,'Nataly Daniela','ginecologia',NULL,NULL,'2026-10-05 12:36:45'),(13,'LAGALGA','dermatologia',NULL,NULL,'2026-10-05 12:37:33');
/*!40000 ALTER TABLE `negocios` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_negocio` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_venta` int(11) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(20) NOT NULL DEFAULT 'Efectivo',
  `estado` varchar(20) NOT NULL DEFAULT 'Pagado',
  `fecha` date NOT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `id_negocio` (`id_negocio`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_venta` (`id_venta`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`),
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `pagos_ibfk_3` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL AUTO_INCREMENT,
  `id_negocio` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `fecha_llegada` date NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `id_negocio` (`id_negocio`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `id_categoria` int(11) NOT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `id_negocio` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  KEY `id_proveedor` (`id_proveedor`),
  KEY `id_negocio` (`id_negocio`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`),
  CONSTRAINT `productos_ibfk_3` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Pupusa de Queso',0.75,0,1,1,1,1),(2,'Pupusa Revuelta',1.00,0,1,1,1,1),(3,'Pupusa de Frijol',0.75,0,1,1,1,1),(4,'Horchata',1.00,0,2,3,1,1),(5,'Cafe con Leche',0.80,0,2,2,1,1),(6,'Semita',1.25,0,3,2,1,1),(7,'Filtro de Aceite',8.50,0,4,4,4,1),(8,'Bateria 12V',65.00,0,4,4,4,1),(9,'Cambio de Aceite (servicio)',25.00,0,5,6,4,1),(10,'Alineado y Balanceo (servicio)',20.00,0,5,5,4,1),(11,'Llanta 175/65 R14',55.00,0,6,5,4,1),(12,'Consulta General',15.00,0,7,NULL,7,1),(13,'Consulta Pediatrica',18.00,0,7,NULL,7,1),(14,'Acetaminofen',3.50,0,8,7,7,1),(15,'Amoxicilina',6.00,0,8,7,7,1),(16,'Examen de Sangre',12.00,0,9,8,7,1),(17,'Jeringa desechable 5ml',0.35,0,12,NULL,13,1),(18,'Guantes de nitrilo (caja x100)',8.50,0,12,NULL,13,1),(19,'Gasas estériles 10x10',0.20,0,12,NULL,13,1),(20,'Alcohol gel 500ml',3.75,0,12,NULL,13,1),(21,'Termómetro digital',6.90,0,12,NULL,13,1),(22,'Mascarilla quirúrgica (caja x50)',5.20,0,12,NULL,13,1),(23,'Suero fisiológico 1000ml',2.10,0,12,NULL,13,1),(24,'Baja lenguas (paquete x100)',1.60,0,12,NULL,13,1),(25,'Algodón hidrófilo 500g',2.90,0,12,NULL,13,1),(26,'Cinta adhesiva médica',1.25,0,12,NULL,13,1);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `id_negocio` int(11) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_proveedor`),
  KEY `id_negocio` (`id_negocio`),
  CONSTRAINT `proveedores_ibfk_1` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'Distribuidora Maiz SA','2222-1111',1,NULL,1),(2,'Lacteos San Julian','2222-1112',1,NULL,1),(3,'Bebidas del Valle','2222-1113',1,NULL,1),(4,'AutoRepuestos El Salvador','2222-2222',4,NULL,1),(5,'Llantas Continental','2222-2223',4,NULL,1),(6,'Lubricantes Total','2222-2224',4,NULL,1),(7,'Farmacia Central','2222-3333',7,NULL,1),(8,'Laboratorios Vida','2222-3334',7,NULL,1),(9,'Insumos Medicos SA','2222-3335',7,NULL,1),(10,'Distribuidora Salud Plus','2222-3336',7,NULL,1);
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador'),(2,'Cajero'),(3,'Cocinero'),(4,'Mecanico'),(5,'Doctor'),(6,'Enfermera'),(7,'Recepcionista'),(8,'Ayudante de Cocina'),(9,'Supervisor'),(10,'Contador');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `usuario_login` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `id_negocio` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario_login` (`usuario_login`),
  KEY `id_rol` (`id_rol`),
  KEY `id_negocio` (`id_negocio`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Maria Chayo','mchayo','$2y$10$whWOI290PTAkJ/tuwllN7.FpjqwcY8V8OFis.jeuZRzG2fFMsPFiK',1,1),(2,'Juan Perez','jperez','1234',3,1),(3,'Sofia Reyes','sreyes','1234',2,2),(4,'Miguel Angel Cruz','mcruz','1234',8,3),(5,'Natalio Gomez','ngomez','$2y$10$DdzWyHy8roftLWKyCO9x9ev2xZWXQSHIz1xiF71IlOHT5zpuPCJ1u',1,4),(6,'Pedro Lopez','plopez','1234',4,4),(7,'Oscar Martinez','omartinez','1234',4,5),(8,'Ricardo Aguilar','raguilar','1234',9,6),(9,'Dr. Pirilin','dpirilin','$2y$10$rOZwIOdiBqrOzzDq43U0yOAr5wklYzp2U.UBaC97QUzq8QoafhAtq',1,7),(10,'Ana Torres','atorres','1234',6,7),(11,'Karla Menjivar','kmenjivar','1234',7,8),(12,'Fernando Castro','fcastro','1234',5,9),(13,'Patricia Alvarado','palvarado','1234',10,10),(14,'Natiti','nato@gmail.com','$2y$10$FcNhgQI6ZpeLgTkg3.zUH.YWTDBKDhWh.DFJiCXXoACFyYnbfet6y',1,12),(15,'Nataly','nataly@gmail.com','$2y$10$hEuRUC.5cDf4qwEJF09jHOzAohgoMQJwMQnz7zdq3NgnUoh3DJ/IC',1,13);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_negocio` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(20) NOT NULL DEFAULT 'Efectivo',
  `estado` varchar(20) NOT NULL DEFAULT 'Pagado',
  PRIMARY KEY (`id_venta`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_negocio` (`id_negocio`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`id_negocio`) REFERENCES `negocios` (`id_negocio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

