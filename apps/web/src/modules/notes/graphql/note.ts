import { gql } from "@apollo/client";

export const NOTE_TREE_QUERY = gql`
  query NoteTree($search: String) {
    noteTree(search: $search) {
      id
      parentId
      title
      position
      isPinned
      hasChildren
      updatedAt
    }
  }
`;

export const NOTE_DETAIL_QUERY = gql`
  query NoteDetail($id: String!) {
    noteDetail(id: $id) {
      id
      title
      content
      customerId
      parentId
      position
      version
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_NOTE_MUTATION = gql`
  mutation CreateNote($data: CreateNoteInput!) {
    createNote(data: $data) {
      id
      title
      content
      parentId
      position
      version
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTE_MUTATION = gql`
  mutation UpdateNote($id: String!, $data: UpdateNoteInput!) {
    updateNote(id: $id, data: $data) {
      id
      title
      content
      customerId
      parentId
      position
      version
      createdAt
      updatedAt
    }
  }
`;

export const MOVE_NOTE_MUTATION = gql`
  mutation MoveNote($data: MoveNoteInput!) {
    moveNote(data: $data) {
      id
      parentId
      position
      updatedAt
    }
  }
`;

export const SET_NOTE_PINNED_MUTATION = gql`
  mutation SetNotePinned($id: String!, $isPinned: Boolean!) {
    setNotePinned(id: $id, isPinned: $isPinned)
  }
`;

export const DELETE_NOTE_MUTATION = gql`
  mutation DeleteNote($id: String!) {
    deleteNote(id: $id) {
      id
    }
  }
`;

export const NOTE_WORKSPACE_META_QUERY = gql`
  query NoteWorkspaceMeta($noteId: String!) {
    noteWorkspaceMeta(noteId: $noteId) {
      tags {
        id
        name
        color
      }
      attachments {
        id
        url
        filename
        mimeType
        size
      }
      shares {
        id
        noteId
        userId
        permission
        includeChildren
        user {
          id
          name
          email
        }
      }
      publicLink {
        id
        includeChildren
        expiresAt
        revokedAt
      }
    }
  }
`;

export const CREATE_NOTE_PUBLIC_LINK_MUTATION = gql`
  mutation CreateNotePublicLink($data: CreateNotePublicLinkInput!) {
    createNotePublicLink(data: $data) {
      token
      link {
        id
        includeChildren
        expiresAt
        revokedAt
      }
    }
  }
`;

export const REVOKE_NOTE_PUBLIC_LINK_MUTATION = gql`
  mutation RevokeNotePublicLink($noteId: String!) {
    revokeNotePublicLink(noteId: $noteId)
  }
`;

export const SHARE_NOTE_WITH_USER_MUTATION = gql`
  mutation ShareNoteWithUser($data: ShareNoteInput!) {
    shareNoteWithUser(data: $data) {
      id
      noteId
      userId
      permission
      includeChildren
      user {
        id
        name
        email
      }
    }
  }
`;

export const REMOVE_NOTE_SHARE_MUTATION = gql`
  mutation RemoveNoteShare($noteId: String!, $userId: String!) {
    removeNoteShare(noteId: $noteId, userId: $userId)
  }
`;

export const SET_NOTE_TAGS_MUTATION = gql`
  mutation SetNoteTags($data: SetNoteTagsInput!) {
    setNoteTags(data: $data) {
      id
      name
      color
    }
  }
`;

export const ADD_NOTE_ATTACHMENT_MUTATION = gql`
  mutation AddNoteAttachment($data: AddNoteAttachmentInput!) {
    addNoteAttachment(data: $data) {
      id
      url
      filename
      mimeType
      size
    }
  }
`;

export const REMOVE_NOTE_ATTACHMENT_MUTATION = gql`
  mutation RemoveNoteAttachment($id: String!) {
    removeNoteAttachment(id: $id) {
      id
    }
  }
`;

export const NOTE_TRASH_QUERY = gql`
  query NoteTrash {
    noteTrash {
      id
      title
      content
      parentId
      position
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

export const RESTORE_NOTE_MUTATION = gql`
  mutation RestoreNote($id: String!) {
    restoreNote(id: $id) {
      id
      title
    }
  }
`;

export const PUBLIC_NOTE_QUERY = gql`
  query PublicNote($token: String!) {
    publicNote(token: $token) {
      note {
        id
        title
        content
        parentId
        position
        updatedAt
      }
      children {
        id
        title
        content
        parentId
        position
        updatedAt
      }
    }
  }
`;
