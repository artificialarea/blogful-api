module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://ckvhtlhgiatvzz:760179d1df8258601211f8509c349fec075cd49572a6d0333ffddded84ec4a20@ec2-18-211-48-247.compute-1.amazonaws.com:5432/d9gqom6bk5vm9m',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/blogful-test',
}