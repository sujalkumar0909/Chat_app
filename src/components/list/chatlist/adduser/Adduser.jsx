import React, { useState, useEffect } from 'react';
import './Adduser.css';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from '../../../../lib/userStore'

const Adduser = () => {
  const [users, setUsers] = useState([]);
  const { currentUser } = useUserStore()

  const handleAdd = async (userId) => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");
    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      await updateDoc(doc(userChatRef, userId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now()
        }),
      });
      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: userId,
          updatedAt: Date.now()
        }),
      });

      // Fetch updated data from database
      const userRef = collection(db, 'users');
      const q = query(userRef, where("id", "==", userId));
      const querySnapshot = await getDocs(q);
      const updatedUser = querySnapshot.docs[0].data();

      // Check if user is already in state
      const existingUser = users.find((user) => user.id === userId);
      if (!existingUser) {
        // Add new user data to state
        setUsers((prevUsers) => [...prevUsers, updatedUser]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');

    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      const usersData = querySnapshot.docs.map((doc) => doc.data());
      setUsers(usersData);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // Fetch initial data from database
    const userRef = collection(db, 'users');
    getDocs(userRef).then((querySnapshot) => {
      const usersData = querySnapshot.docs.map((doc) => doc.data());
      setUsers(usersData);
    });
  }, []);

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {users.map((user) => (
        <div className="user" key={user.id}>
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={() => handleAdd(user.id)}>Add User</button>
        </div>
      ))}
    </div>
  )
}

export default Adduser;