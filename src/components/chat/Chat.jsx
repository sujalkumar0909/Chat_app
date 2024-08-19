import React, { useEffect,useRef,useState } from 'react'
import './Chat.css'
import EmojiPicker from 'emoji-picker-react'

import {
  arrayUnion,
  doc,onSnapshot,
  updateDoc} from "firebase/firestore";
  import {db} from '../../lib/firebase';
import { usechatStore } from '../../lib/chatStore';
import uploads from '../../lib/uploads';
import { useUserStore } from '../../lib/userStore';
const Chat = () => {
  const [text,setText]=useState("");
  const [img,setImg]=useState({
    file:null,
    url:"",
  })
  const [chat,setChat]=useState()
  const [open,setOpen]=useState(false);
  const {chatId,user}=usechatStore();
  const endRef=useRef(null);
  const {currentUser}=useUserStore();

  useEffect(()=>{
    endRef.current?.scrollIntoView({behaviour:"smooth"});
  },[]);

  useEffect(()=>{
    const unSub=onSnapshot(
      doc(db,"chats",chatId),
      (res)=>{
        setChat(res.data());
      }
    );
    return ()=>{
      unSub();
    };
  },[chatId]);
  console.log(chat);

  const handleemoji=e=>{
    setText((prev)=>prev+e.emoji);
    setOpen(false)
  };
  const handleImg=(e)=>{
    if(e.target.files[0]){
      setImg({
        file:e.target.files[0],
        url:URL.createObjectURL(e.target.files[0]),
      })
    }
  }

  const handleSend=async()=>
  {
    if(text==="")
      return;

    let imgUrl=null;

    try {
      if(img.file){
        imgUrl=await uploads(img.file)
      }
      await updateDoc(doc(db,"chats",chatId),{
        messages:arrayUnion({
          senderId:currentUser.id,
          text,
          createdAt:new Date(),
          ...(imgUrl && {img:imgUrl})
        }),
      })
      const userIDs=[currentUser.id,user.id];
      userIDs.forEach(async (id)=>{
      const userChatsRef=doc(db,"userchats",id)
      const userChatsSnapshot=await getDoc(userChatsRef)
      if(userChatsSnapshot.exists()){
        const userChatsData=userChatsSnapshot.data()
        const chatIndex=userChatsData.chats.findIndex(c=>c.chatId===chatId)
        userChatsData.chats[chatIndex].lastMessage=text
        userChatsData.chats[chatIndex].isSeen=id===currentUser.id?true:false;
        userChatsData.chats[chatIndex].updatedAt=Date.now();
        await updateDoc(userChatsRef,{
          chats:userChatsData.chats,
        })
      }
    });
    } catch (error) {
      console.log(error);
    }
    setImg({
      file:null,
      url:"",
    })
    setText("");
  }
  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
            <img src="./avatar.png" alt="" />
            <div className="texts">
                <span>Sujal Kumar</span>
                <p>Lorem, ipsum dolor sit amet</p>
            </div>
        </div>
        <div className="icons">
            <img src="./phone.png" alt="" />
            <img src="./video.png" alt="" />
            <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        { chat?.messages?.map(message=>(
        <div className={message.senderId===currentUser?.id?"message own" :"message"} key={message?.createAt}>
          <div className="texts">
           {message.img && <img src="message.img" alt="error" />}
            <p>{message.text}</p>
          </div>
        </div>
))}
 {img.url && <div className="message own">
  <div className="texts">
    <img src={img.url} alt="error" />
  </div>
</div>}
<div ref={endRef}></div>
      </div>

        <div className="bottom">
            <div className="icons">
              <label htmlFor="file">
                <img src="./img.png" alt="" />
                </label>
                <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
                <img src="./camera.png" alt="" />
                <img src="./mic.png" alt="" />
            </div>
            <input type="text" placeholder='Enter a message' value={text} onChange={e=>setText(e.target.value)}/>
            <div className="emoji">
                <img src="./emoji.png" alt="" onClick={()=>setOpen((prev)=>!prev)}/>
                <div className="picker">
                <EmojiPicker open={open} onEmojiClick={handleemoji}/>
                </div>
            </div>
            <button className="sendbutton" onClick={handleSend}>Send</button>
        </div>
      </div>
  )
}

export default Chat
