import { useState } from "react";
import axios from "axios";

function App() {
  const [id, setId] = useState("");
  const [customer, setCustomer] = useState("");

  const searchCustomer = async () => {
    const response =
      await axios.get(
        `http://127.0.0.1:8000/api/customer/${id}`
      );

    setCustomer(response.data.customer);
  };

  return (
    <div>
      <h1>Customer Lookup</h1>

      <input
        value={id}
        onChange={(e) =>
          setId(e.target.value)
        }
      />

      <button onClick={searchCustomer}>
        Search
      </button>

      <h2>{customer}</h2>
    </div>
  );
}

export default App;