# Recommender_Systems_Insights_Investigation

- [your_project_name](#your_project_name)
- [Basic Information [Students only]](#basic-information-students-only)
- [Introduction](#introduction)
- [Research Summary](#research-summary)
- [Keywords](#keywords)
- [Data](#data)
- [Dependencies](#dependencies)
- [Installation & Usage](#installation--usage)
- [License](#license)

# Basic Information

- Student: Zihan Wang
- Supervisors: Qing Wang, Jie Yang, Di Yang
- 2024



# Introduction
Recommender systems are widely used in modern lives and contribute to many industries. Therefore, methods to evaluate and improve them are important. Nowadays, much research has been done to improve the system aspects such as algorithms. However, user experiences are not only affected by the systems but heavily rely on the context when using the systems. Therefore, the research on user aspects to understand their experiences is as important. This study contributes an approach that uses collaborative reflection to find insights into users’ experiences with recommender systems.

# Research Summary
This study presents the influences of context on user experiences with recommender systems. This study investigates the importance of situational and
personal contexts like mood, time, and location in shaping user satisfaction with recommendations. The research adopts a method based on collaborative reflection, where participants engage in tasks using their YouTube watch history, paired with another individual for real-time discussion. By analyzing contextual influences and the values users wish to achieve, the study identifies key patterns in user behavior and insights into personal preferences. This research not only contributes to the evaluation of recommender systems but also highlights the need for systems to align with both the goals of users and broader societal values. The usability of the proposed method was tested to be successful in crowdsourcing, yielding practical implications for future evaluation and improvements of recommender systems.

# Keywords
Recommender systems, Collaborative Reflection, Crowdsourcing

# Data
SURF Drive link: https://surfdrive.surf.nl/files/index.php/s/gbGwzEn0xgAR8PJ?path=%2F

# Dependencies
 "dependencies": {

  "axios": "^1.6.7",

  "chart.js": "^3.9.1",

  "chartjs-node-canvas": "^4.1.6",

  "chartjs-plugin-datalabels": "^2.2.0",

  "express": "^4.18.2",

  "moment": "^2.30.1",

  "multer": "^1.4.5-lts.1",

  "mysql": "^2.18.1",

  "node-fetch": "^3.3.2",

  "router": "^1.3.8",

  "router-view": "^1.1.7",

  "socket.io": "^4.7.4",

  "socket.io-client": "^4.7.4",

  "vue": "^3.4.15",

  "vue-router": "^4.2.5",

  "vuex": "^4.0.2"

 },

 "devDependencies": {

  "@rushstack/eslint-patch": "^1.3.3",

  "@vitejs/plugin-vue": "^5.0.3",

  "@vitejs/plugin-vue-jsx": "^3.1.0",

  "@vue/eslint-config-prettier": "^8.0.0",

  "cors": "^2.8.5",

  "eslint": "^8.49.0",

  "eslint-plugin-vue": "^9.17.0",

  "prettier": "^3.0.3",

  "vite": "^5.3.1"

 }

# Installation & Usage
**Installation:** Node.js, Vue3, Nginx

To properly deploy this, you have to run both the **node.js server**(backend) and the **website** server. 

**Server:**

cd \Interactive platform\Insights investigation\server

node index.js

**Web:**

- You will first need to apply for a SSL Certificate.
- Install Nginx on your server
- Change the nginx.conf file accordingly
- Build the project
- use the command 'nginx' to run the server

To test: npm run dev

To build: npm run build

# License
*We encourage you to use an open license and by default the repository contains an Apache License 2.0.*
