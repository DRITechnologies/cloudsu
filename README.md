
# Advanced configurations

### Environment Variables:

#### Redis cache (local cache will be used if REDIS_HOST is not set)  
* REDIS_HOST - IP address or hostname of your Redis server
* REDIS_PORT - Redis server port
* REDIS_PASSWORD - Redis password for authentication (not required)

#### Application settings
* CLOUDSU_PORT - Http listening port for the server (default: 3000)
* CLOUDSU_LOG_LEVEL - Winston log level (default: debug)

### API:

#### Headers (needed for each request)
```json
{
  "aws_region": "us-west-2",
  "aws_account": "DEFAULT",
  "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiZHByaWNoYTE4OUBnbWFpbC5jb20iLCJpYXQiOjE0NjE2NDA1NTIsImV4cCI6MTQ2MTcyNjk1Mn0.EDxmnM_1H91H115grMxasdfasdfasdfaseeONMPc4wsGxI"
}
```

#### Create Stack
##### POST /api/v1/stacks/:stack_name
```json
{ 
  "instance_store": false,
  "ebs_volume": false,
  "multi_az": true,
  "ebs_root_size": 30,
  "volumes": [{ "type": "gp2", "size": 30 }],
  "recipes": ["recipe[nodejs]"],
  "stack_name": "Testin13",
  "build_size": "HA",
  "create_elb": true,
  "route_53": true,
  "hosted_zone": "cloudsu.io",
  "ebs_root_volume": true,
  "elb":{
     "ping_port": 443,
     "ping_protocol": "HTTPS",
     "ping_path": "/api/v1/status"
  },
  "min_size": 1,
  "desired_size": 1,
  "max_size": 3,
  "instance_size": "t2.nano",
  "key": "gator",
  "ami": "ami-c229c0a2",
  "app_name": "cloudsu",
  "app_version": "prod-1413",
  "domain": "cloudsu.io",
  "regions": ["us-west-2a", "us-west-2b", "us-west-2c"],
  "elb_security_groups": ["sg-adb4b6c8"],
  "security_groups": ["sg-adb4b6c8"]
 }
```

#### Upgrade Stack All Stages
##### PATCH /api/v1/upgrade
```json
{ 
  "stack_name": "Testing",
  "min_size": 1,
  "desired_size": 1,
  "max_size": 3,
  "ami": "ami-c229c0a2",
  "instance_size": "t2.nano",
  "app_version": "prod13",
  "cleanup_type": "delete"
}
```

#### Upgrade Stack Stage 1
##### PATCH /api/v1/upgrade/stage1
```json
{ 
  "stack_name": "Testing",
  "min_size": 1,
  "desired_size": 1,
  "max_size": 3,
  "ami": "ami-c229c0a2",
  "instance_size": "t2.nano",
  "app_version": "prod13"
}
```

#### Upgrade Stack Stage 2
##### PATCH /api/v1/upgrade/stage2
```json
{ 
  "stack_name": "Testing"
}

#### Upgrade Stack Stage 3
##### PATCH /api/v1/upgrade/stage3
```json
{ 
  "stack_name": "Testing",
}

#### Upgrade Stack Stage 4
##### PATCH /api/v1/upgrade/stage4
```json
{ 
  "stack_name": "Testing",
  "cleanup_type": "delete"
}

#### Delete Stack
##### DELETE /api/v1/stacks/:stack_name

