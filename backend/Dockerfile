# Build stage
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies
RUN mvn dependency:go-offline -B
COPY src ./src
# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy the built jar file
COPY --from=build /app/target/feedback-1.0.0.jar app.jar
# Expose the default port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
