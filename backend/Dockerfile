# ==============================================================================
# Stage 1: Build & Package
# ==============================================================================
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper & project definition first (layer caching)
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Convert line endings for Windows compatibility and ensure execution permissions
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Trigger dependency download (improves subsequent build times)
RUN ./mvnw dependency:go-offline

# Copy source code and build the artifact
COPY src ./src
RUN ./mvnw package -DskipTests

# ==============================================================================
# Stage 2: Production Runtime
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root user for security best practices
RUN addgroup -S groceryscout && adduser -S groceryscout -G groceryscout
USER groceryscout:groceryscout

# Copy the built artifact from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the standard Spring Boot port
EXPOSE 8080

# Health check endpoint for container orchestration
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
