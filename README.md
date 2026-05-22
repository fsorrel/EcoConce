
  # Revisar archivo ecoconce-web

  This is a code bundle for Revisar archivo ecoconce-web. The original project is available at https://www.figma.com/design/VOHtfMQypOdvsiUnqXS2Ur/Revisar-archivo-ecoconce-web.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
## Pagina
  http://localhost:5173
  
## Base de datos
  http://localhost:8081/h2-console/login.do
  jdbc:h2:mem:ecoconce

 ## si es que pasa un error con package-lock.json ejecutar los siguientes comandos en orden:

   Remove-Item -Force package-lock.json

   npm config set registry https://npmjs.org

   npm cache clean --force

   npm install --no-audit --no-fund
