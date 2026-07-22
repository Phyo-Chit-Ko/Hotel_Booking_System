import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MyBookings.css";
import Swal from "sweetalert2";

export default function MyBookings() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);



  useEffect(() => {

    const userId = user?.user_id || user?.id;

    if (userId) {

      axios.get(`http://localhost:8000/api/my-bookings/${userId}`)
        .then(res => {

          console.log("API RESPONSE:", res.data);

          setBookings(res.data);

        })
        .catch(err => {

          console.log(err);

        });

    }

  }, [user]);




  // Calculate refund policy
  // If the booking was never confirmed (still "pending"), the guest
  // gets a full 100% refund regardless of how close check-in is.
  const getRefundPolicy = (checkInDate, deposit, status) => {

    const today = new Date();

    const checkIn = new Date(checkInDate);


    const daysLeft = Math.ceil(
      (checkIn - today) /
      (1000 * 60 * 60 * 24)
    );


    let refundPercent = 0;

    const isPending = status?.toLowerCase() === "pending";

    if (isPending) {

      // Booking was never confirmed by the hotel, so guest gets full deposit back.
      refundPercent = 100;

    }
    else if (daysLeft > 3) {

      refundPercent = 100;

    }
    else if (daysLeft >= 1 && daysLeft <= 3) {

      refundPercent = 50;

    }
    else {

      refundPercent = 0;

    }


    return {

      daysLeft,

      refundPercent,

      refundAmount:
        (Number(deposit) * refundPercent) / 100

    };

  };





  // Cancel booking API

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`http://localhost:8000/api/bookings/${bookingId}`, {
        first_name: selectedBooking.first_name,
        last_name: selectedBooking.last_name,
        phone: selectedBooking.phone,
        status: "cancelled",
        room_number: null
      });

      // Update UI
      setBookings(prev =>
        prev.map(item =>
          item.booking_id === bookingId
            ? { ...item, status: "Cancelled" }
            : item
        )
      );

      // --- REPLACE YOUR OLD ALERT HERE ---
      Swal.fire({
        icon: "success",
        title: "Booking Cancelled",
        text: "Your booking has been cancelled successfully.",
        confirmButtonColor: "#c79b56", // Matches your gold luxury theme
        background: "#ffffff",
        color: "#333",
        backdrop: "rgba(0,0,0,0.8)"
      });
      // ------------------------------------

    } catch (error) {
      console.log("Full Error Object:", error);

      // Also update the error alert for consistency
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: error.response?.data?.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
        background: "#ffffff",
        color: "#333"
      });
    }
  };

  return (

    <div className="booking-container">


      {
        bookings.length > 0 ?


          bookings.map((booking) => (


            <div className="booking-card" key={booking.booking_id}>


              <div className="booking-header">
  {/* BACK BUTTON - Left Side */}
  <button className="back-btn" onClick={() => navigate(-1)}>
    ← Back
  </button>

  {/* STATUS & CANCEL - Right Side */}
  <div className="right-actions">
    <span className={`status ${booking.status?.toLowerCase()}`}>
      {booking.status}
    </span>

    {booking.status?.toLowerCase() !== "cancelled" && (
      <button
        className="booking-cancel-btn"
        onClick={() => {
          setSelectedBooking(booking);
          setShowCancelModal(true);
        }}
      >
        Cancel Booking
      </button>
    )}
  </div>
</div>





              <div className="booking-details">


                <div className="detail-item">

                  <label>
                    Guest Name
                  </label>

                  <p>
                    {booking.first_name} {booking.last_name}
                  </p>

                </div>




                <div className="detail-item">

                  <label>
                    Room Type
                  </label>

                  <p>
                    {booking.room_type?.name}
                  </p>

                </div>





                <div className="detail-item">

                  <label>
                    Phone
                  </label>

                  <p>
                    {booking.phone}
                  </p>

                </div>





                <div className="detail-item">

                  <label>
                    Guests
                  </label>

                  <p>
                    Adults: {booking.adult}
                    <br />
                    Children: {booking.child}
                  </p>

                </div>





                <div className="detail-item">

                  <label>
                    Check In
                  </label>

                  <p>
                    {new Date(booking.check_in_date)
                      .toLocaleDateString()}
                  </p>

                </div>





                <div className="detail-item">

                  <label>
                    Check Out
                  </label>

                  <p>
                    {new Date(booking.check_out_date)
                      .toLocaleDateString()}
                  </p>

                </div>





                <div className="detail-item">

                  <label>
                    Deposit
                  </label>

                  <p>
                    ${booking.deposit}
                  </p>

                </div>



              </div>


            </div>


          ))


          :

          <div className="empty-booking">
            No bookings found
          </div>


      }






      {/* CANCEL POLICY MODAL */}

      {

        showCancelModal && selectedBooking &&


        <div className="modal-overlay">


          <div className="cancel-modal">
            <h2>Cancellation Policy</h2>

            {selectedBooking.status?.toLowerCase() === "pending" ? (
              <p>
                This booking has not been confirmed yet, so you are eligible
                for a <b>100% refund</b> of your deposit.
              </p>
            ) : (
              <>
                <p>Please check refund rules before cancelling:</p>
                <ul>
                  <li>More than 3 days before check-in: <b>100% Refund</b></li>
                  <li>1 - 3 days before check-in: <b>50% Refund</b></li>
                  <li>Less than 1 day before check-in: <b>0% Refund</b></li>
                </ul>
              </>
            )}

            <hr />

            {/* Refund Info Section */}
            {(() => {
              const refund = getRefundPolicy(selectedBooking.check_in_date, selectedBooking.deposit, selectedBooking.status);
              return (
                <div className="refund-info">
                  <p>Days left: <b>{refund.daysLeft} days</b></p>
                  <p>Refund: <b>{refund.refundPercent}%</b></p>
                  <p>Refund Amount: <b>${refund.refundAmount}</b></p>
                </div>
              );
            })()}

            {/* --- NEW SECTION START --- */}
            <div className="confirmation-text" style={{ margin: '15px 0', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
              <p><b>Are you sure you want to cancel?</b></p>
              <p>If you have any questions or issues,</p>
              <p> please contact us:</p>
              <p>
                Phone: <b>09-788881363</b><br />
                Email: <b>sainawkham436@gmail.com</b>
              </p>
            </div>
            {/* --- NEW SECTION END --- */}

            <div className="modal-buttons">
              <button className="close-modal" onClick={() => setShowCancelModal(false)}>
                Keep Booking
              </button>
              <button className="confirm-cancel" onClick={() => {
                handleCancelBooking(selectedBooking.booking_id);
                setShowCancelModal(false);
              }}>
                Confirm
              </button>

            </div>
          </div>


        </div>


      }



    </div>


  );

}
