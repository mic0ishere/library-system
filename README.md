# Library Management System

Made as a system for a school library to keep track of books and allow students to borrow them, logging in with their Microsoft Teams account. It has an i18n system to support multiple languages, using English by default.

Made with [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) and [Azure AD](https://learn.microsoft.com/en-us/entra/identity-platform/).

## Installation
1. Clone the repository
2. Run `npm install` or `yarn install` to install the dependencies
3. Copy the `.env.example` file to `.env` and fill in the required values
4. Copy the `config.example.yaml` file to `config.yaml` and update the configuration as needed
5. Build the project with `npm run build` or `yarn build`
6. Start the server with `npm start` or `yarn start`

## Development
If you want to develop the project, you can run `npm run dev` or `yarn dev` to start the server in development mode. This will automatically restart the server when you make changes to the code.

## Configuration
The configuration of environment secrets is done through the `.env` file. If you want to change the configuration of the library system, you can do so in the `config.yaml` file.

## Localisation (i18n)
If you want to add new languages or change the existing ones, you can do so by editing the `locals` folder. Each language has its own subfolder, with the language code as the name. The keys are the same for all languages, so you can copy the module file from `en` subfolder and translate the values.

## License
This project is licensed under the MIT License. You can read the full license in the `LICENSE` file.

## Contributing
If you want to contribute to the project, you can fork the repository and make a pull request. Make sure to follow the code style and write an adequate description of the changes you made.