Here's the step-by-step process to locally view the web page using the provided file structure:

1. Prerequisites 🛠️
Ensure you have Node.js and npm (Node Package Manager) installed on your system. You can check this by running:

Bash

node -v
npm -v
2. Project Setup
Navigate to the root directory of your project (e.g., frost-risk-dashboard/) in your terminal.

A. Install Dependencies
You must install all the libraries listed in the package.json file, including React, Vite, Recharts, and Tailwind CSS.

Bash

npm install
B. Ensure Tailwind CSS is Configured
The build process relies on your Tailwind configuration (tailwind.config.js) and the CSS import (src/index.css) to generate the correct styles. The npm install step should be sufficient if the configuration files are present as suggested.

3. Run the Development Server
The package.json includes a script to start the development server using Vite.

Run the following command in your terminal:

Bash

npm run dev
Expected Output
Vite will compile your application and start a server. The output in your terminal will look similar to this:

> frost-risk-dashboard@1.0.0 dev
> vite

  VITE v5.3.1  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to enable network access
  ➜  press h + enter to show help
4. View the Web Page in Browser
Open your web browser (Chrome, Firefox, Edge, etc.).

Enter the Local URL shown in the terminal (usually http://localhost:5173/).

The Frost Risk Dashboard should now be visible and fully functional locally, allowing you to click on stations and select forecast horizons.

Alternative: Build and Preview (Production Simulation)
If you want to view the final, optimized production version (which is generally faster but takes longer to set up), you can run:

Build the project: This command compiles all files into a static dist/ folder.

Bash

npm run build
Preview the build: This starts a small static server to host the contents of the dist/ folder.

Bash

npm run preview
