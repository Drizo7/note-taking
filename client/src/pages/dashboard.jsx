import React, { useState , useEffect } from "react";
import { Button, Input } from "../components/form";
import axios from 'axios'; // Import axios
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
  const token = new URLSearchParams(window.location.search).get('token');

  if (token) {
    localStorage.setItem('token', token); // Store the token in localStorage

    // Redirect to dashboard or other authenticated routes
    navigate('/dashboard');
  }
}, []);

  // Fetch user details and notes on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
  console.log("Token from localStorage:", token);
    if (token) {
      axios
        .get(`${API_BASE_URL}/googleauth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setUserName(response.data.name))
        .catch((error) => console.error("Error fetching user info:", error));
    } else {
      alert("No token found");
    }

    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(response.data);
      } catch (error) {
       alert("Error fetching notes: " + error);
      }
    };

    fetchNotes();
  }, [API_BASE_URL]);

  const handleAddNote = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/notes`,
        { title, body },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNotes([...notes, response.data]);
      setTitle("");
      setBody("");
    } catch (error) {
      alert("Error creating note : " + error.message);
    }
  };

  const handleSaveNote = async () => {
    if (editingNote !== null) {
      try {
        const updatedNote = await axios.put(
          `${API_BASE_URL}/api/notes/${notes[editingNote]._id}`,
          { title, body },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const updatedNotes = [...notes];
        updatedNotes[editingNote] = updatedNote.data;
        setNotes(updatedNotes);
        setEditingNote(null);
      } catch (error) {
        alert("Error updating note:" + error);
      }
    } else {
      handleAddNote();
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notes/${notes[index]._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotes(notes.filter((_, i) => i !== index));
    } catch (error) {
      alert("Error deleting note:" + error);
    }
  };

  const handleEditNote = (index) => {
    setEditingNote(index);
    setTitle(notes[index].title);
    setBody(notes[index].body);
  };

  const handlePushToGoogleSheets = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/notes/push-to-google-sheets`, {}, 
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );


    if (response.status === 200) {
      alert('Notes pushed to Google Sheets successfully!');
    } else {
      alert(`Failed to push notes: ${response.data.message}`);
    }
  } catch (err) {
    console.error('Error pushing notes:', err);
    alert('An error occurred while pushing notes.');
  }
};


const handleChangePassword = async () => {
  
  const token = localStorage.getItem("token");
  console.log("Token being sent:", token);

  if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

  try {
    const response = await axios.put(
      `${API_BASE_URL}/auth/changePassword`,
      { oldPassword, newPassword },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    alert(response.data.message);
      setChangePasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
  } catch (error) {
    console.error("Full error object:", error);
    console.error("Error response:", error.response);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
    
    alert(error.response?.data?.message || "Error updating password");
  }
};
  

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/googleauth/logout`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };


  return (
    <div className="min-h-screen w-full flex bg-gray-100">
      {/* Top Bar */}
      <div className="absolute top-0 right-0 p-4">
        <div className="relative">
          <button
            className="flex items-center space-x-2 bg-gray-200 p-2 rounded-md"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <span className="font-semibold">{userName || "Dummy"}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
              <button
                onClick={() => setChangePasswordModalOpen(true)}
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              >
                Change Password
              </button>
              <button className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => handleLogout()}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Left Panel */}
      <div className="w-1/2 p-6 bg-white border-r border-gray-300">
        <h1 className="text-2xl font-semibold text-black mb-4">My Notes</h1>
        <Button
          label="Add New Note"
          onClick={() => {
            setEditingNote(null);
            setTitle("");
            setBody("");
          }}
        />

        <div className="mt-4">
          <Button
            label="Push to Google Sheets"
            onClick={handlePushToGoogleSheets}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          />
        </div>

        {/* List of Notes */}
        <div className="mt-4 space-y-4">
          {notes.map((note, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-md shadow-sm"
            >
              <h2 className="font-semibold">{note.title}</h2>
              <p>{note.body.slice(0, 100)}...</p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleEditNote(index)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNote(index)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 bg-white">
        <h1 className="text-2xl font-semibold mb-4">
          {editingNote !== null ? "Edit Note" : "Create a New Note"}
        </h1>

        {/* Note Title Input */}
        <div className="mb-4">
          <Input
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            className="mb-4"
          />
        </div>
        {/* Note Body Text Area */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your note here..."
          rows="10"
          className="w-full p-4 border border-gray-300 rounded-md"
        ></textarea>

        {/* Save Button */}
        <div className="mt-4">
          <Button
            label={editingNote !== null ? "Save Changes" : "Save Note"}
            onClick={handleSaveNote}
          />
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <Input
            label="Old Password"
              type="password"
              placeholder="Old Password"
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="New Password"
              className="w-full p-2 mb-4  border border-gray-300 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
            label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex justify-end space-x-2 mt-4 ">
              <button
                className="w-full flex-rows gap-4 hover:opacity-80 transitions bg-red-500 text-white text-sm font-medium px-2 py-3 rounded"
                onClick={() => setChangePasswordModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="w-full flex-rows gap-4 hover:opacity-80 transitions bg-gray-600 text-white text-sm font-medium px-2 py-3 rounded"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
