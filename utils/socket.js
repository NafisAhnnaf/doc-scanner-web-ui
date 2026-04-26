const sendProgressUpdate = (socket, progress) => {
  socket.emit("scanProgress", { progress });
};
