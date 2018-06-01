# AgroWeb
Projeto interno WEB01 AgroWeb da CPE Jr que consiste em desenvolver um sistema web para intermediação de compra e venda de insumos agrícolas em forma de grupos de compra.

## Passo-a-passo para rodar o projeto na sua máquina
1. Clone a pasta do projeto na sua máquina;
2. Abra a pasta do projeto no Terminal;
3. Certifique-se de que o Node.js está instalado em sua máquina executando o comando `node -v`
4. Baixe o arquivo `.env` que está no drive do projeto e coloque-o no diretório do projeto;
5. Execute o comando `npm install`. Este comando far com que todos os módulos descritos do arquivo `package.json` sejam instalados;
6. Execute o comando `npm start` para iniciar o servidor. Caso queira parar o servidor, basta clicar `CTRL + C`.

## Passo-a-paso para começar a criação de uma nova página `.hbs`
1. Agora que você já cumpriu o passo-a-passo anterior e tem os arquivos do projeto em sua máquina, inicie um novo `branch` para criar sua página;
2. Vá até `views/layouts/default.hbs`, copie e cole esse arquivo onde você deseja criar sua página;
3. Renomeie esse arquivo para o nome da sua página;
4. Procure utilizar apenas classes do Bootstrap, caso isso não seja possível, importe um arquivo `.css` adicionando uma tag `link` entre as linhas `{{#section 'stylesheets}}` e a linha `{{/section}}`;
5. Caso seja necessário utilizar scripts na página, adicione seu código JavaScript entre as linhas `{{#section 'scripts}}` e a linha `{{/section}}`;
