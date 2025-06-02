const mongoose = require('mongoose');
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient({ url: redisUrl });

// IIFE to await connection
(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Redis connection failed:', err);
    }
})();

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
      return exec.apply(this, arguments);
  }


  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
  }));

  // If we have a value for 'key' in redis, return it
    const cacheValue = await client.hGet(this.hashKey, key);
    //console.log('cacheValue result :', 'hashKey: ', this.hashKey, 'key: ', key, 'cacheValue: ',  cacheValue);

    // If we do, return it
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    // Otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);

    await client.hSet(this.hashKey, key, JSON.stringify(result), {
        EX: 3600, //Cache expires in 1 hour
    });


  return result;
}

module.exports = {
  async clearHash(hashKey) {
    await client.del(JSON.stringify(hashKey))
  }
}

