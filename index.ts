import dotenv from "dotenv";
import { login } from "masto";
import { Client } from "twitter-api-sdk";
import { TwitterClient } from 'twitter-api-client';

dotenv.config();

const main = async () => {
  const twitterMachine = new Client(process.env.TWITTER_BEARER_TOKEN as string);

  const twitterUser = new TwitterClient({
    apiKey: process.env.TWITTER_CONSUMER_KEY as string,
    apiSecret: process.env.TWITTER_CONSUMER_SECRET as string,
    accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
    accessTokenSecret: process.env.TWITTER_ACCESS_SECRET as string,
  });

  const masto = await login({
    url: 'https://hachyderm.io',
    accessToken: process.env.MASTODON_ACCESS_TOKEN,
  });

  const mastoStream = await masto.stream.streamUser();

  // Subscribe to updates
  mastoStream.on('update', (status) => {
    const text = status.content.replace( /(<([^>]+)>)/ig, '');
    console.log(`${status.account.username}: ${text}`);
    if (status.account.username === 'onatm') {
      twitterUser.tweetsV2.createTweet({ text });
    }
  });

  // Subscribe to notifications
  mastoStream.on('notification', (notification) => {
    console.log(`${notification.account.username}: ${notification.type}`);
  });

  // await twitterMachine.tweets.addOrDeleteRules(
  //   {
  //     add: [
  //       { value: "from:onatm" },
  //       { value: "from:github" }
  //     ],
  //   }
  // );

  // await twitterMachine.tweets.addOrDeleteRules(
  //   {
  //     delete: {
  //       values: ["from:onatm", "from:github"]
  //     }
  //   }
  // );

  const rules = await twitterMachine.tweets.getRules();
  // console.log(rules);

  // if (!rules.meta.result_count) {
  //   process.exit(0);
  // }

  // const stream = twitterMachine.tweets.searchStream({
  //   "tweet.fields": ["author_id", "text"],
  // });
  // for await (const tweet of stream) {
  //   console.log(tweet.data);
  // }
  console.log('twooter is running...')
}

main().catch((error) => {
  throw error;
});