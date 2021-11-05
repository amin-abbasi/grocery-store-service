db.createUser({
  user: 'store_db',
  pwd: 'GuMr3yIFvTH9',
  roles: [
    {
      role: 'readWrite',
      db: 'store'
    }
  ]
});
