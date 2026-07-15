const button = document.getElementById("startButton");

button.addEventListener("click", function(){

    const team = document.getElementById("team").value;

    localStorage.setItem("team", team);

    window.location.href = "game.html";

});