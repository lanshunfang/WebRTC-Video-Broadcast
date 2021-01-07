#!/bin/bash
export webRTCPath=/opt/webrtc

# https://ourcodeworld.com/articles/read/1175/how-to-create-and-configure-your-own-stun-turn-server-with-coturn-in-ubuntu-18-04
# Accept Fireware
# 80 : TCP # if you need to setup coturn with SSL
# 443 : TCP # if you need to setup coturn with SSL
# 3478,5349 : UDP/TCP

apt-get update -y
apt-get install  -y coturn

vim /etc/default/coturn
# TURNSERVER_ENABLED=1

vim /etc/turnserver.conf

# # STUN server port is 3478 for UDP and TCP, and 5349 for TLS.
# # Allow connection on the UDP port 3478
# listening-port=3478
# # and 5349 for TLS (secure)
# tls-listening-port=5349

# # Require authentication
# fingerprint
# lt-cred-mech

# server-name=your.domain.com
# realm=your.domain.com
# external-ip=45.32.37.165

# # Important: 
# # Create a test user if you want
# # You can remove this user after testing

# total-quota=100
# stale-nonce=600

# # Path to the SSL certificate and private key. In this example we will use
# # the letsencrypt generated certificate files.
# cert=/etc/letsencrypt/live/your.domain.com/cert.pem
# pkey=/etc/letsencrypt/live/your.domain.com/privkey.pem
# # Specify the allowed OpenSSL cipher list for TLS/DTLS connections
# cipher-list="ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384"

# # Specify the process user and group
# proc-user=turnserver
# proc-group=turnserver

turnadmin -l
#turnadmin -a -u USER_NAME -r your.domain.com -p PWD

systemctl restart coturn
systemctl status coturn
systemctl enable coturn

# WebRTC

# https://gabrieltanner.org/blog/webrtc-video-broadcast

# test
# https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
# STUN or TURN URI : 
# stun:your.domain.com:5349
# turn:your.domain.com:5349
# TURN username: USER_NAME
# TURN password: PASSWORD

echo "Install NVM and node latest"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
nvm install node

cd ${webRTCPath}

apt install -y docker.io
npm install
# dev 
# mock data
export TURN_USERS=sw010[chat.xiaofang.me]
echo sw123321 > "./host-token"
node server.js

docker build --tag webrtc/broadcast .
# test
docker run -v $(pwd):/usr/src/app --env TURN_USERS=$(turnadmin -l) -p 4000:4000 --rm -it webrtc/broadcast
# run
docker run -v $(pwd):/usr/src/app --env TURN_USERS=$(turnadmin -l) -p 4000:4000 -it -d --restart always webrtc/broadcast
# Change nginx redirect with host your.domain.com, at port 443 to 4000

# mkdir -p /etc/nginx/sites-enabled-stream/
# vim /etc/nginx/sites-enabled-stream/your.domain.com.conf 
# # Add stream block to the same level of `http` in /etc/nginx/nginx.conf
# # include /etc/nginx/sites-enabled-stream/*;


# stream {

# 	# https://docs.nginx.com/nginx/admin-guide/load-balancer/tcp-udp-load-balancer/
# 	# load balance ready
# 	# https://docs.nginx.com/nginx/admin-guide/security-controls/terminating-ssl-tcp/
# 	upstream webrtc_stream_backend {
# 		#hash   $remote_addr consistent;
# 		server 127.0.0.1:4000;
# 	}
# 	server {
# 		listen 2443 ssl;
# 		listen [::]:2443 ssl;
# 		#server_name	your.domain.com;

# 		proxy_pass webrtc_stream_backend;

# 		ssl_certificate /root/.acme.sh/your.domain.com/fullchain.cer;
# 		ssl_certificate_key  /root/.acme.sh/your.domain.com/your.domain.com.key;
# 		ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
# 		ssl_protocols TLSv1.1 TLSv1.2;
# 		ssl_prefer_server_ciphers on;
# 		ssl_handshake_timeout 10s;
# 		ssl_session_cache shared:SSL:5m;
# 		ssl_session_timeout 4h;		
# 	}
# }

curl https://get.acme.sh | sh
~/.bashrc
apt-get install -y socat
acme.sh --issue -d your.domain.com --pre-hook "(service nginx stop &); sleep 10"  --post-hook "service nginx start" --renew-hook "service nginx stop" --standalone  \

# Open broadcast
https://your.domain.com:2443/broadcast.html

# Open watcher



