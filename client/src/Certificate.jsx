import React, { useState, useEffect } from "react";
import axios from "axios";
import "./cerificate.css";
import { GrCertificate } from "react-icons/gr";

const Certificate = () => {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [certificates, setCertificates] = useState([]);

  const server = process.env.REACT_APP_SERVER_URL;

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(
          `${server}/get`
        );
        console.log(response.data.certificates);
        setCertificates(response.data.certificates);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };

    fetchCertificates();
  }, [certificates]);

  const generateCertificate = async () => {
    try {
      const formattedDate = formatDate(date);
      const response = await axios.post(
        `${server}/generate`,
        {
          name,
          email,
          course,
          date: formattedDate,
        }
      );
      if (response.status === 201) {
        alert("Certificate generated successfully.");
      } else {
        alert("Failed to generate certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate");
    }
  };

  return (
    <div className="main">
      <div className="container">
        <h1>Certificate Generator</h1>
        <div className="input-container">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="course">Course</label>
          <input
            type="text"
            required
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="date">Approval Date</label>
          <input
            type="date"
            required
            placeholder="dd/mm/yyyy"
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button onClick={generateCertificate}>Generate</button>
      </div>

      <div className="certificate-container">
        {certificates.length > 0 && (
          <div className="certificate-icons">
            <h2>Generated Certificates</h2>
            {certificates.map((details, index) => (
              <div className="certificate-icon" key={index}>
                <a
                  className="drive-url"
                  href={details.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GrCertificate />
                  <p>{details.name}</p>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificate;
