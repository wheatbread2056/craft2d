function getMobileStatus() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

if (getMobileStatus()) {
    console.log("User is on a mobile device.");
} else {
    console.log("User is on a desktop.");
}
