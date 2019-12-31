# werewolfchatnode

Things have gotten a lot more complicated with the server side stuff since I first wrote the backend deployer, so I have not had the time to reautomate the build. You will need to do some of it your self for now.

If you want to use this as your own back end you will need to have the following installed with apt/yum

npm
tor
i2p
mongodb
nginx

I have the following NPM modules installed to make this work
├─┬ express@4.17.1
│ ├─┬ accepts@1.3.7
│ │ ├─┬ mime-types@2.1.24
│ │ │ └── mime-db@1.40.0
│ │ └── negotiator@0.6.2
│ ├── array-flatten@1.1.1
│ ├─┬ body-parser@1.19.0
│ │ ├── bytes@3.1.0
│ │ ├── content-type@1.0.4 deduped
│ │ ├── debug@2.6.9 deduped
│ │ ├── depd@1.1.2 deduped
│ │ ├─┬ http-errors@1.7.2
│ │ │ ├── depd@1.1.2 deduped
│ │ │ ├── inherits@2.0.3
│ │ │ ├── setprototypeof@1.1.1 deduped
│ │ │ ├── statuses@1.5.0 deduped
│ │ │ └── toidentifier@1.0.0
│ │ ├─┬ iconv-lite@0.4.24
│ │ │ └── safer-buffer@2.1.2
│ │ ├── on-finished@2.3.0 deduped
│ │ ├── qs@6.7.0 deduped
│ │ ├─┬ raw-body@2.4.0
│ │ │ ├── bytes@3.1.0 deduped
│ │ │ ├── http-errors@1.7.2 deduped
│ │ │ ├── iconv-lite@0.4.24 deduped
│ │ │ └── unpipe@1.0.0 deduped
│ │ └── type-is@1.6.18 deduped
│ ├─┬ content-disposition@0.5.3
│ │ └── safe-buffer@5.1.2 deduped
│ ├── content-type@1.0.4
│ ├── cookie@0.4.0
│ ├── cookie-signature@1.0.6
│ ├─┬ debug@2.6.9
│ │ └── ms@2.0.0
│ ├── depd@1.1.2
│ ├── encodeurl@1.0.2
│ ├── escape-html@1.0.3
│ ├── etag@1.8.1
│ ├─┬ finalhandler@1.1.2
│ │ ├── debug@2.6.9 deduped
│ │ ├── encodeurl@1.0.2 deduped
│ │ ├── escape-html@1.0.3 deduped
│ │ ├── on-finished@2.3.0 deduped
│ │ ├── parseurl@1.3.3 deduped
│ │ ├── statuses@1.5.0 deduped
│ │ └── unpipe@1.0.0
│ ├── fresh@0.5.2
│ ├── merge-descriptors@1.0.1
│ ├── methods@1.1.2
│ ├─┬ on-finished@2.3.0
│ │ └── ee-first@1.1.1
│ ├── parseurl@1.3.3
│ ├── path-to-regexp@0.1.7
│ ├─┬ proxy-addr@2.0.5
│ │ ├── forwarded@0.1.2
│ │ └── ipaddr.js@1.9.0
│ ├── qs@6.7.0
│ ├── range-parser@1.2.1
│ ├── safe-buffer@5.1.2
│ ├─┬ send@0.17.1
│ │ ├── debug@2.6.9 deduped
│ │ ├── depd@1.1.2 deduped
│ │ ├── destroy@1.0.4
│ │ ├── encodeurl@1.0.2 deduped
│ │ ├── escape-html@1.0.3 deduped
│ │ ├── etag@1.8.1 deduped
│ │ ├── fresh@0.5.2 deduped
│ │ ├── http-errors@1.7.2 deduped
│ │ ├── mime@1.6.0
│ │ ├── ms@2.1.1 extraneous
│ │ ├── on-finished@2.3.0 deduped
│ │ ├── range-parser@1.2.1 deduped
│ │ └── statuses@1.5.0 deduped
│ ├─┬ serve-static@1.14.1
│ │ ├── encodeurl@1.0.2 deduped
│ │ ├── escape-html@1.0.3 deduped
│ │ ├── parseurl@1.3.3 deduped
│ │ └── send@0.17.1 deduped
│ ├── setprototypeof@1.1.1
│ ├── statuses@1.5.0
│ ├─┬ type-is@1.6.18
│ │ ├── media-typer@0.3.0
│ │ └── mime-types@2.1.24 deduped
│ ├── utils-merge@1.0.1
│ └── vary@1.1.2
├─┬ mongodb@3.3.3
│ ├── bson@1.1.1
│ ├─┬ require_optional@1.0.1
│ │ ├── resolve-from@2.0.0
│ │ └── semver@5.7.1
│ ├── safe-buffer@5.1.2 deduped
│ └─┬ saslprep@1.0.3
│   └─┬ sparse-bitfield@3.0.3
│     └── memory-pager@1.5.0
├─┬ mongoose@5.7.5
│ ├── bson@1.1.1 deduped
│ ├── kareem@2.3.1
│ ├── mongodb@3.3.2 extraneous
│ ├── mongoose-legacy-pluralize@1.0.2
│ ├── mpath@0.6.0
│ ├─┬ mquery@3.2.2
│ │ ├── bluebird@3.5.1
│ │ ├── debug@3.1.0 extraneous
│ │ ├── regexp-clone@1.0.0 deduped
│ │ ├── safe-buffer@5.1.2 deduped
│ │ └── sliced@1.0.1 deduped
│ ├── ms@2.1.2 extraneous
│ ├── regexp-clone@1.0.0
│ ├── safe-buffer@5.1.2 deduped
│ ├── sift@7.0.1
│ └── sliced@1.0.1
└─┬ randomstring@1.1.5
  └── array-uniq@1.0.2
  
  I also recomend getting a domain from freenom.com so you can get a free dns name and then use letsencrypt to have a https site


you will need to add a proxy pass config so that nginx knows to serve the /api/ directory
        location /api/ {

        proxy_pass http://your private ip:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgr


For your TOR hidden service I refer you to this guide: https://2019.www.torproject.org/docs/tor-onion-service.html.en

For setting up an eepsite try this: https://medium.com/@mhatta/how-to-set-up-untraceable-websites-eepsites-on-i2p-1fe26069271d



you will need to change up your nginx conf as well so that the the tor site is not sent to https in the event you used the letssencrypt auto configurer

in /etc/nginx/nginx.conf make sure the the server_names_hash_bucket_size is 256 to handle the length of tor addresses
        server_names_hash_bucket_size 256;


in /etc/nginx/sites-available/default add the following above the lets enrypted auto generated section
server {

        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;
        server_name yourtoraddress.onion;


        location /api/ {

        proxy_pass http://your private ip:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        }

        listen 80 ;
        listen [::]:80 ;
}




