# Build stage: immagine con Maven + JDK 17
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copia solo i file di definizione dipendenze (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia sorgenti e compila (JAR in target/)
COPY src ./src
RUN mvn package -B -DskipTests

# Runtime stage: solo JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Porta esposta (Spring Boot default)
EXPOSE 8080

# JAR prodotto da Spring Boot repackage
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
