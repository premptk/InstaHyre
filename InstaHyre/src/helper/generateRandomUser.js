function generateRandomPhoneNumber() {
    const phoneNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
    return phoneNumber.toString();
  }
  
  function generateRandomName() {
    const names = ['John Doe', 'Jane Doe', 'Alice Smith', 'Bob Johnson', 'Eva Davis'];
  
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  }
  
  function generateRandomEmail(name) {
    const emailPrefix = name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
    const emailDomain = ['example.com', 'gmail.com', 'yahoo.com'];
    const randomDomainIndex = Math.floor(Math.random() * emailDomain.length);
    const emailAddress = emailPrefix + '@' + emailDomain[randomDomainIndex];
    return emailAddress;
  }


  module.exports = () => {
      const name = generateRandomName();
      const phoneNumber = generateRandomPhoneNumber();
      const email = generateRandomEmail(name);
    
      return {
        name: name,
        number: phoneNumber,
        email: email
      };
  };