Earbud Webserver + Passport/MySQL Authentication using Express
===========================

Steps for setting up Pi, prepare for a small hour of work, might work this into a script

// make sure pi is up-to-date
sudo apt-get update && sudo apt-get upgrade

// clone and build wiringPi
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build

// get, unzip, delete zip for lights
wget -O lights.zip https://www.dropbox.com/s/nxdrkuk94w9fpqo/lights.zip?dl=1
unzip lights.zip
rm -r lights.zip

cd lights
g++ -o kaku kaku.cpp -I/usr/local/include -L/usr/local/lib -lwiringPi

//This enables you to use the command without usage of sudo
sudo chown root /home/pi/wiringPi/lights/kaku
sudo chmod ug+sx /home/pi/wiringPi/lights/kaku

//test the klik aan klik uits with this code if you want - the model i use has a dial on the back so i set it to C 1 for   example
./kaku C 1 on
./kaku C 1 off

// go back to the home folder, edit .bashrc to enable the command from within any folder
cd
sudo nano .bashrc
  ---add this line to the end of the file----
  export PATH=$PATH:/home/pi/wiringPi/lights/

// run bash to reinitialize the .bashrc
bash

// Setup node.js
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb

// check version to see if it was installed correctly
node -v

// setup mysql-server, can take a little while after passw setup
sudo apt-get install mysql-server --fix-missing

- setup mysql root user password as '1234' for now, as the config is currently hardcoded

// create a dir for your apps if you prefer, I know I do
mkdir apps
cd apps
// this will create a folder inside apps called earbud which will hold our app
git clone https://github.com/FunkeyFlo/earbud.git
cd earbud
// check if all dependencies are present, this can take quite long, especially on a non rev.2 model DO NOT INTERRUPT THIS
npm install
// setup database from schema
mysql -u'root' -p'1234'
  (IN SHELL) \. schema.sql
  (check if database exist) SELECT DATABASE();
// run the app and voila, visit the ip address of your pi with port 3001 in your browser ex: 192.168.188.22:3001
node app.js
