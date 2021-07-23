function stateChanger() {
  const stateInput = document.querySelector("#state");
  const countryInput = document.querySelector("#countryInput");

  if (countryInput.value.toUpperCase().includes("US")) {
    stateInput.classList.remove("none");
  } else {
    stateInput.classList.add("none");
  }
}
