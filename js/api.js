document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetch");
  const resultBox = document.getElementById("result");

  fetchBtn.addEventListener("click", async () => {
    const version = document.getElementById("version").value;
    const book = document.getElementById("book").value.trim();
    const chapter = document.getElementById("chapter").value.trim();
    const verse = document.getElementById("verse").value.trim();

    if (!book || !chapter || !verse) {
      resultBox.innerHTML = "<p
