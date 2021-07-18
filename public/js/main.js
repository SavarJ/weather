function stateChanger() {
  if (
    document.querySelector("#countryInput").value.toUpperCase().includes("US")
  ) {
    document.querySelector("#state").classList.remove("none");
  } else {
    document.querySelector("#state").classList.add("none");
  }
}
