declare module '@env' {
  export const API_ENDPOINT: string;
  export const API_KEY: string;
  export const API_LOGIN: string;
  export const API_REGISTER: string;
  export const API_FORGOTPASSWORD: string
  export const API_RESETPASSWORD: string;

  export const API_MIDDLEWARE_REFRESH_TOKEN: string;

  export const API_GET_NOTIFICATE: string;
  export const API_NOTIFICATE_APPROVE_REQUEST: string;
  export const API_NOTIFICATE_REJECT_REQUEST: string;
  export const API_NOTIFICATE_MARK_READ: string;
  export const API_NOTIFICATE_SAVE_PUSH_TOKEN: string;

  export const API_UPDATEUSER: string;
  export const API_UPDATECHILD: string;

  export const API_DELETEUSER: string;
  export const API_USERLIST: string;
  export const API_DELETECHILD: string;
  export const API_CHILDLIST: string;

  export const API_LOGOUT: string;
  export const API_USERPIC: string;

  // parent
  export const API_GET_CHILD: string;
  export const API_ADD_CHILD_PARENT: string;
  export const API_ASSESSMENT_CHILD: string;
  export const API_ASSESSMENT_NEXT_PARENT: string;
   export const API_ASSESSMENT_GET_DETAIL: string;
  
 
  // supervisor
  export const API_GET_ALLDATA: string;
  export const API_ASSESSMENT_DATA: string;
  export const API_GET_CHILD_OF_ROOM: string;
  export const API_UPDATE_ROOM: string;
  export const API_DELETE_ROOM: string;
  export const API_GET_ROOM_DATA: string;
  export const API_ASSESSMENT_CHILD_SUPERVISOR: string;
  export const API_ASSESSMENT_CHILD_PARENT_FOR_SUPERVISOR: string;
  export const API_DELETE_CHILD_SUPERVISOR: string;
  export const API_ADD_CHILD_SUPERVISOR: string;
  export const API_ADD_ROOM: string;
  export const API_ASSESSMENT_NEXT_SUPERVISOR: string;
  export const API_NOT_PASSED: string;
  

  // history
  export const API_ASSESSMENT_HISTORY: string;
  export const API_UPDATE_PASSED: string;
  export const API_UPDATE_NOT_PASSED: string;
  
}
