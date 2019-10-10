import { Mam as MAM } from '@iota/client-load-balancer';
import { trytesToAscii } from '@iota/converter';
import { Account, Conversation } from '../storage';
import { getAddress, getMamRoot } from './mam';
import { verifyRSA } from './crypto';
import { fetchContactInfo } from './contact';

export const fetchNewMessagesFromConversation = async (iotaSettings, conversationSeed) => {
  const conversation = Conversation.getById(conversationSeed);
  if (conversation && conversation.channels.length) {
    console.log(`Start fetching new message from seed ${conversationSeed}`);
    await Promise.all(
      conversation.channels.map(async channel => {
        MAM.init(iotaSettings);
        const root = channel.mamRoot;
        try {
          const result = await MAM.fetch(root, 'restricted', channel.sideKey);
          console.log(`Channel ${channel.mamRoot} messages`, result);
          if (result && result.messages) {
            let index = 0;
            result.messages.forEach(message => {
              const parsedMessage = JSON.parse(trytesToAscii(message));
              if (parsedMessage.content && parsedMessage.createdTime) {
                const messageObj = { ...parsedMessage, index };
                Conversation.addMessage(conversationSeed, channel.mamRoot, messageObj);
                index += 1;
              }
            });
          }
          if (result.nextRoot) {
            Conversation.updateChannelAddress(conversationSeed, channel.mamRoot, result.nextRoot);
          }
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
    if (result && result.messages) {
      console.log(`Conversation ${root} channels:`, result);
      await Promise.all(
        result.messages.map(async message => {
          const parsedMessage = JSON.parse(trytesToAscii(message));
          if (parsedMessage.mamRoot && parsedMessage.sideKey && parsedMessage.ownerRoot && parsedMessage.signature) {
            const { mamRoot, sideKey, ownerRoot, signature } = parsedMessage;
            const contact = await fetchContactInfo(iotaSettings, ownerRoot);
            if (contact) {
              if (verifyRSA(mamRoot, contact.publicKey, signature)) {
                Conversation.addChannel(conversation.seed, { owner: contact, mamRoot, sideKey });
              }
            }
          }
        })
      );
    }
    if (result.nextRoot) {
      Conversation.updateConversationAddress(conversationSeed, getAddress(result.nextRoot));
    }
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

export const fetchConversations = async (iotaSettings, seed) => {
  const { sideKey } = Account.data;

  try {
    let mamState = MAM.init(iotaSettings, seed);
    mamState.channel.count = 2;
    mamState = MAM.changeMode(mamState, 'restricted', sideKey);

    const root = MAM.getRoot(mamState);
    console.log('root', root);
    const result = await MAM.fetch(root, 'restricted', sideKey);
    console.log('conversations', result);
    if (result && result.messages) {
      result.messages.forEach(message => {
        const parsedMessage = JSON.parse(trytesToAscii(message));
        if (
          parsedMessage.conversationSeed &&
          parsedMessage.conversationSideKey &&
          parsedMessage.channelSeed &&
          parsedMessage.channelSideKey
        ) {
          const conversationRoot = getMamRoot(iotaSettings, parsedMessage.conversationSeed);
          Conversation.add({
            mamRoot: conversationRoot,
            seed: parsedMessage.conversationSeed,
            sideKey: parsedMessage.conversationSideKey
          });
          const channelRoot = getMamRoot(iotaSettings, parsedMessage.channelSeed);
          const nextAddress = getAddress(channelRoot);
          Conversation.addChannel(parsedMessage.conversationSeed, {
            mamRoot: channelRoot,
            seed: parsedMessage.channelSeed,
            nextAddress,
            sideKey: parsedMessage.channelSideKey,
            self: true
          });
        }
      });
      console.log('Conversations after', Conversation.data);
    }
  } catch (e) {
    console.log(e);
  }
};
