there is already capacity in room type migration, i want to add maximum_capacity. maximum_capacity is total persons that can stay in specific room type. and capacity is standard total person. if total guests is more than standard capacity i want to charge extra person fee for each extra person. and total guests can't be more than maximum_capacity. and remove num_of_rooms column in room type migration. i don't need to store this as a column. but add extra_bed_fee column in this migration. and add input box for extra_bed_fee in addRoomTypeModal.jsx and store it in database. next -> at rooms migration, remove capacity column because capacity is controlled by room_types migration(may be already correct). also remove capacity in addRoomModel. and remove grid_col, grid_row, grid_w, grid_h in rooms migration. i don't use these columns any more. and at roomManagement, i can delete room even if this room is occupied in reservation. really, it shouldn't happen. if there is reservation that use this room number as check-in for the future date or currently using for staying guest, this room can't be deleted. same logic for roomTypeManagment.cannot delete if rooms belong to this room type. next -> at Rooms.jsx, i want to add information (standard Capacity(currently Capacity in room_types migration), maximum Capacity). and at the same jsx file, there is form that can book rooms. now i use hard code for Deposit. i want to request 50% of room charges.example formula -> (total_room * roomtype's base price *total nights /2). and at this form i want to check another validation. if (adult + child) is more that maximum_capicity of booked room type and Total Rooms is only 1, i want to show error like "total person is more than room's maximum capacity, please choose more than 1(total rooms) room or reduce total". this is example error. total person(adult + child) is 10, maximum_capacity of booked room type is 6, but he booked 2 rooms at total rooms , this must be valid form. and if guest want to book rooms for a specific period and there are no more available rooms for booked room type for this period, i want to show apology letter in this form with small pop_up or alert .next -> at Bookings.jsx, i want to edit columns of table UI.  at Booking UI table, i don't want scroll bar under table. all columns must be visible in one page without scrolling to right. i want to remove PHONE, DEPOSIT, DEPOSIT SS,  HANDLED BY columns. but i want to add Details button at action column. only after clicking details button, i want to show all information of booking that are in the bookings migration with pop_up. there must be action button in details pop_up and work as edit button of my original code. and if total rooms is more than 1 (eg. 3 total rooms), there must be 3 assign room input boxs. now i use text input for assign room. i want to make these input boxs as drop down that show room number that are already filtered by booked room type and room status (available) for booked period(check in date - check-out date). after assign rooms, booking is transfer to reservation. at this case, if guest booked 2 rooms and receptionist or manager assign 2 rooms for this bookings. there must be two reservations with assigned room numbers in reservation table. at this time, after assigning rooms and status is changed to confirmed, i want to send email to booked user email. information what i want to be included in this email will be described below. now booking_id(pk) of bookings table is just number. i want booking_id like BK-00001, BK-000002. next -> at reservation, i don't want scroll bar under table like booking. i want to drop guest type, source, handled by, total amount and balance columns in table UI and want to show all information of reservation migration with details pop_up like booking. and make payment, edit, extend and room move button must be in detail pop up. and i want to seperate name as first name and last name. and reservation must be searchable by booking_id (BK-00001). and i want to check duplicate guests in different rooms at the same period (check in date - check out date). because same guests can't stay in two rooms at the same time. and i want to confirm about status of reservation. there are 5 status(confirmed, check_in, occupied, check_out and no_show). if checkin date is future day, status is confirmed. if checkin date is today, status is check_in. if guest already checked in(after check in process), status is occupied. if checkout date is today, status is check_out. and if guest didn't come to hotel and didn't stay at hotel, status is no_show. and i show 3/10(example) as daily check in. 10 is total daily check_in  and 3 is total of already checked in today. when i count total Daily check_in, count only check_in date is today and status is check_in or occupied. and total already checked in today must count only reservation that check_in date is today and status is occupied. don't count for no_show status reservation. same logic for Daily Check out, tracking rows where checkout date is today and filtering by checkout status. count by status (check_out). and IN-HOUSE TODAY button. i want to change it to Occupied Rooms. at this button, count reservation that status is check in date is today and status is check_in or occupied, reservation that status is occupied. i want to show number of rooms that will occupied tonight. and add comment column to payment table. when i move booking to reservation, deposit payment is saved. at this time i want to set commend as "deposit Payment" . and add comment input box at the form of making payment and save this commend also in Payment table. and show this comment in payment page UI. here is example booking confirmed email format -> Dear John Smith,

Thank you for choosing Grand Hotel.

We are pleased to confirm your reservation. Below are your booking details.

Reservation Information
Reservation No.: RES-20260718-001
Guest Name: John Smith
Stay Details
Check-in: 20 July 2026
Check-out: 23 July 2026
Nights: 3
Guests: 2 Adults
Room Details
Room Type: Deluxe Room
Room Number: 305
Bed Type: King Bed
Payment
Total Amount: $360.00
Deposit Paid: $100.00
Balance Due at Check-in: $260.00
Hotel Policies
Check-in: From 2:00 PM
Check-out: Before 12:00 PM

If you have any questions or need to modify your reservation, please contact us.

We look forward to welcoming you to Grand Hotel.

Best regards,

Grand Hotel
Phone: +95-XXX-XXXXXX
Email: reservations@grandhotel.com...     and i want to send email when guest cancel his booking also. pls