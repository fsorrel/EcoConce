# EcoConce

## 1. Clonar proyecto

```bash
git clone https://github.com/fsorrel/EcoConce.git
cd EcoConce
git checkout main
```

## 2. Ejecutar backend

```bash
cd ecoconce-backend
mvn clean package
mvn spring-boot:run
```

## 3. Ejecutar frontend

Abrir otra terminal en la raíz del proyecto:

```bash
cd ecoconce-frontend
npm install
npm run dev
```

## 4. Abrir proyecto en el navegador

```txt
http://localhost:5173
```

## 5. Abrir consola H2

```txt
http://localhost:8081/h2-console
```

## 6. Datos H2

```txt
JDBC URL: jdbc:h2:mem:ecoconce
User: SA
Password:
```

## 7. Compilar backend para revisar errores

```bash
cd ecoconce-backend
mvn clean package
```

## 8. Compilar frontend para revisar errores

```bash
cd ecoconce-frontend
npm run build
```
