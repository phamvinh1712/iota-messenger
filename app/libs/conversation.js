import { Mam as MAM } from '@iota/client-load-balancer';
import { trytesToAscii } from '@iota/converter';
import { Conversation } from '../storage';
import { getAddress } from './mam';
import { verifyRSA } from './crypto';
import { fetchContactInfo } from './contact';

export const fetchNewMessagesFromConversation = async (iotaSettings, conversationSeed) => {
  const conversation = Conversation.getById(conversationSeed);
  console.log(conversation);
  if (conversation && conversation.channels.length) {
    await Promise.all(
      conversation.channels.map(async channel => {
        let mamState = MAM.init(iotaSettings, channel.seed);
        mamState = MAM.changeMode(mamState, 'restricted', channel.sideKey);
        console.log('channel',channel);
        if (channel.messages.length) {
          mamState.channel.start = channel.messages.length;
        }
        const root = MAM.getRoot(mamState);
        console.log('root:', root);
        try {
          const result = await MAM.fetch(root, 'restricted', channel.sideKey);
          console.log(result);
          if (result && result.messages) {
            await Promise.all(
              result.messages.map(async message => {
                const parsedMessage = JSON.parse(trytesToAscii(message));
                if (parsedMessage.content && parsedMessage.createdTime) {
                  const messageObj = { ...parsedMessage };
                  Conversation.addMessage(conversationSeed, channel.mamRoot, messageObj);
                }
              })
            );
          }
          Conversation.updateChannelAddress(conversationSeed, channel.mamRoot, getAddress(result.nextRoot));
        } catch (e) {
          console.log(e);
        }
      })
    );
  }
};

export const fetchNewMessagesFromAllConversation = async iotaSettings => {
  const conversationSeeds = Conversation.keys;
  await Promise.all(
    conversationSeeds.map(async key => {
      await fetchNewMessagesFromConversation(iotaSettings, key);
    })
  );
};

export const fetchNewChannelFromConversation = async (iotaSettings, conversationSeed) => {
  const conversation = Conversation.getById(conversationSeed);
  let mamState = MAM.init(iotaSettings, conversationSeed);
  mamState = MAM.changeMode(mamState, 'restricted', conversation.sideKey);

  const root = MAM.getRoot(mamState);
  try {
    const result = await MAM.fetch(root, 'restricted', conversation.sideKey);
    console.log(result);
    if (result && result.messages) {
      await Promise.all(
        result.messages.map(async message => {
          const parsedMessage = JSON.parse(trytesToAscii(message));
          if (parsedMessage.mamRoot && parsedMessage.sideKey && parsedMessage.ownerRoot && parsedMessage.signature) {
            const { mamRoot, sideKey, ownerRoot, signature } = parsedMessage;
            const contact = await fetchContactInfo(iotaSettings, ownerRoot);
            console.log('parsedMessage', parsedMessage);
            console.log('contact', contact);
            if (contact) {
              if (verifyRSA(mamRoot, contact.publicKey, signature)) {
                console.log('verify');
                Conversation.addChannel(conversation.seed, { owner: contact, mamRoot, sideKey });
              }
            }
          }
        })
      );
    }
    Conversation.updateConversationAddress(conversationSeed, getAddress(result.nextRoot));
    await fetchNewMessagesFromConversation(iotaSettings, conversationSeed);
  } catch (e) {
    console.log(e);
  }
};

export const fetchNewChannelFromAllConversation = async iotaSettings => {
  const conversationSeeds = Conversation.keys;
  await Promise.all(
    conversationSeeds.map(async key => {
      await fetchNewChannelFromConversation(iotaSettings, key);
    })
  );
};
