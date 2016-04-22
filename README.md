
# Advanced configurations

### Environment Variables

#### Redis cache (local cache will be used if REDIS_HOST is not set)  
* REDIS_HOST - IP address or hostname of your Redis server
* REDIS_PORT - Redis server port
* REDIS_PASSWORD - Redis password for authentication (not required)

#### Application settings
* CLOUDSU_PORT - Http listening port for the server (default: 3000)
* CLOUDSU_LOG_LEVEL - Winston log level (default: debug)
