import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';
import { useState } from 'react';

import { fetchRelationships } from 'soapbox/actions/accounts';
import { importFetchedAccount, importFetchedAccounts } from 'soapbox/actions/importer';
import snackbar from 'soapbox/actions/snackbar';
import { getNextLink } from 'soapbox/api';
import compareId from 'soapbox/compare_id';
import { useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useApi, useAppDispatch, useFeatures } from 'soapbox/hooks';
import { normalizeChatMessage } from 'soapbox/normalizers';
import { flattenPages, PaginatedResult, updatePageItem } from 'soapbox/utils/queries';

import { queryClient } from './client';

import type { IAccount } from './accounts';

export interface IChat {
  id: string
  unread: number
  created_by_account: string
  last_message: null | {
    account_id: string
    chat_id: string
    content: string
    created_at: string
    discarded_at: string | null
    id: string
    unread: boolean
  }
  created_at: Date
  updated_at: Date
  accepted: boolean
  discarded_at: null | string
  account: IAccount
}

export interface IChatMessage {
  account_id: string
  chat_id: string
  content: string
  created_at: Date
  id: string
  unread: boolean
  pending?: boolean
}

export interface IChatSilence {
  id: number
  account_id: number
  target_account_id: number
}

const chatKeys = {
  chat: (chatId?: string) => ['chats', 'chat', chatId] as const,
  chatMessages: (chatId: string) => ['chats', 'messages', chatId] as const,
  chatSearch: (searchQuery?: string) => searchQuery ? ['chats', 'search', searchQuery] : ['chats', 'search'] as const,
  chatSilences: ['chatSilences'] as const,
};

const reverseOrder = (a: IChat, b: IChat): number => compareId(a.id, b.id);

const useChatMessages = (chatId: string) => {
  const api = useApi();

  const getChatMessages = async (chatId: string, pageParam?: any): Promise<PaginatedResult<IChatMessage>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || `/api/v1/pleroma/chats/${chatId}/messages`;
    const response = await api.get(uri);
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;
    const result = data.sort(reverseOrder).map(normalizeChatMessage);

    return {
      result,
      link,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery(chatKeys.chatMessages(chatId), ({ pageParam }) => getChatMessages(chatId, pageParam), {
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo);

  return {
    ...queryInfo,
    data,
  };
};

const useChats = (search?: string) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { setUnreadChatsCount } = useStatContext();

  const getChats = async (pageParam?: any): Promise<PaginatedResult<IChat>> => {
    const endpoint = features.chatsV2 ? '/api/v2/pleroma/chats' : '/api/v1/pleroma/chats';
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || endpoint;
    const response = await api.get<IChat[]>(uri, {
      params: {
        search,
      },
    });
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;

    // TODO: change to response header
    setUnreadChatsCount(sumBy(data, (chat) => chat.unread));

    // Set the relationships to these users in the redux store.
    dispatch(fetchRelationships(data.map((item) => item.account.id)));
    dispatch(importFetchedAccounts(data.map((item) => item.account)));

    return {
      result: data,
      hasMore,
      link,
    };
  };

  const queryInfo = useInfiniteQuery(chatKeys.chatSearch(search), ({ pageParam }) => getChats(pageParam), {
    keepPreviousData: true,
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo);

  const chatsQuery = {
    ...queryInfo,
    data,
  };

  const getOrCreateChatByAccountId = (accountId: string) => api.post<IChat>(`/api/v1/pleroma/chats/by-account-id/${accountId}`);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId?: string) => {
  const api = useApi();
  const actions = useChatActions(chatId!);
  const dispatch = useAppDispatch();

  const getChat = async () => {
    if (chatId) {
      const { data } = await api.get<IChat>(`/api/v1/pleroma/chats/${chatId}`);

      dispatch(importFetchedAccount(data.account));

      return data;
    }
  };

  const chat = useQuery<IChat | undefined>(chatKeys.chat(chatId), getChat);

  return { ...actions, chat };
};

const useChatActions = (chatId: string) => {
  const api = useApi();
  const { setChat, setEditing } = useChatContext();

  const markChatAsRead = (lastReadId: string) => {
    api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/read`, { last_read_id: lastReadId })
      .then(({ data }) => updatePageItem(['chats', 'search'], data, (o, n) => o.id === n.id))
      .catch(() => null);
  };

  const createChatMessage = (chatId: string, content: string) => {
    return api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/messages`, { content });
  };

  const deleteChatMessage = (chatMessageId: string) => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}`);

  const acceptChat = useMutation(() => api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/accept`), {
    onSuccess(response) {
      setChat(response.data);
      queryClient.invalidateQueries(chatKeys.chatMessages(chatId));
      queryClient.invalidateQueries(chatKeys.chatSearch());
    },
  });

  const deleteChat = useMutation(() => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}`), {
    onSuccess(response) {
      setChat(null);
      setEditing(false);
      queryClient.invalidateQueries(chatKeys.chatMessages(chatId));
      queryClient.invalidateQueries(chatKeys.chatSearch());
    },
  });

  return { createChatMessage, markChatAsRead, deleteChatMessage, acceptChat, deleteChat };
};

const useChatSilences = () => {
  const api = useApi();

  const getChatSilences = async () => {
    const { data } = await api.get<IChatSilence[]>('/api/v1/pleroma/chats/silences');

    return data;
  };

  return useQuery<IChatSilence[]>(chatKeys.chatSilences, getChatSilences, {
    placeholderData: [],
  });
};

const useChatSilence = (chat: IChat | null) => {
  const api = useApi();
  const dispatch = useAppDispatch();

  const [isSilenced, setSilenced] = useState<boolean>(false);

  const getChatSilences = async () => {
    const { data } = await api.get(`api/v1/pleroma/chats/silence?account_id=${chat?.account.id}`);
    return data;
  };

  const fetchChatSilence = async () => {
    const data = await getChatSilences();
    if (data) {
      setSilenced(true);
    } else {
      setSilenced(false);
    }
  };

  const handleSilence = () => {
    if (isSilenced) {
      deleteSilence();
    } else {
      createSilence();
    }
  };

  const createSilence = () => {
    setSilenced(true);

    api.post(`api/v1/pleroma/chats/silence?account_id=${chat?.account.id}`)
      .then(() => {
        dispatch(snackbar.success('Successfully silenced this chat.'));
        queryClient.invalidateQueries(chatKeys.chatSilences);
      })
      .catch(() => {
        dispatch(snackbar.error('Something went wrong trying to silence this chat. Please try again.'));
        setSilenced(false);
      });
  };

  const deleteSilence = () => {
    setSilenced(false);

    api.delete(`api/v1/pleroma/chats/silence?account_id=${chat?.account.id}`)
      .then(() => {
        dispatch(snackbar.success('Successfully unsilenced this chat.'));
        queryClient.invalidateQueries(chatKeys.chatSilences);
      })
      .catch(() => {
        dispatch(snackbar.error('Something went wrong trying to unsilence this chat. Please try again.'));
        setSilenced(true);
      });
  };

  return { isSilenced, handleSilence, fetchChatSilence };
};

export { chatKeys, useChat, useChatActions, useChats, useChatMessages, useChatSilences, useChatSilence };
