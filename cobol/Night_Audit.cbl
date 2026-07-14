       IDENTIFICATION DIVISION.
       PROGRAM-ID. NIGHT-AUDIT.
       
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT STAYS-FILE ASSIGN TO STAYS-FILE-PATH
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT SUMMARY-FILE ASSIGN TO SUMMARY-FILE-PATH
               ORGANIZATION IS LINE SEQUENTIAL.
       
       DATA DIVISION.
       FILE SECTION.
       FD  STAYS-FILE.
       01  STAY-RECORD.
           05 ROOM-NUMBER      PIC X(10).
           05 RECORD-TYPE      PIC X(10).
           05 ROOM-REV-IN      PIC 9(7)V99.
           05 EXTRA-REV-IN     PIC 9(7)V99.
       
       FD  SUMMARY-FILE.
       01  SUMMARY-RECORD      PIC X(60).
       
       WORKING-STORAGE SECTION.
       01  STAYS-FILE-PATH     PIC X(200).
       01  SUMMARY-FILE-PATH   PIC X(200).
       01  AUDIT-DATE-ARG      PIC X(10).
       01  WS-ARG-NUM          PIC 9(1).
       01  WS-EOF-STAYS        PIC X VALUE 'N'.
       
       01  WS-TOTALS.
           05 WS-CHECKIN       PIC 9(5) VALUE 0.
           05 WS-CHECKOUT      PIC 9(5) VALUE 0.
           05 WS-INHOUSE       PIC 9(5) VALUE 0.
           05 WS-NOSHOW        PIC 9(5) VALUE 0.
           05 WS-REVENUE       PIC 9(9)V99 VALUE 0.
       
       01  WS-OUT-LINE.
           05 OUT-DATE         PIC X(10).
           05 OUT-CHECKIN      PIC 9(5).
           05 OUT-CHECKOUT     PIC 9(5).
           05 OUT-INHOUSE      PIC 9(5).
           05 OUT-NOSHOW       PIC 9(5).
           05 OUT-REVENUE      PIC 9(9)V99.
       
       PROCEDURE DIVISION.
       MAIN-LOGIC.
           MOVE 1 TO WS-ARG-NUM
           DISPLAY WS-ARG-NUM UPON ARGUMENT-NUMBER
           ACCEPT STAYS-FILE-PATH FROM ARGUMENT-VALUE
       
           MOVE 2 TO WS-ARG-NUM
           DISPLAY WS-ARG-NUM UPON ARGUMENT-NUMBER
           ACCEPT SUMMARY-FILE-PATH FROM ARGUMENT-VALUE
       
           MOVE 3 TO WS-ARG-NUM
           DISPLAY WS-ARG-NUM UPON ARGUMENT-NUMBER
           ACCEPT AUDIT-DATE-ARG FROM ARGUMENT-VALUE
       
           OPEN INPUT STAYS-FILE
           PERFORM UNTIL WS-EOF-STAYS = 'Y'
               READ STAYS-FILE
                   AT END MOVE 'Y' TO WS-EOF-STAYS
                   NOT AT END PERFORM PROCESS-STAY
               END-READ
           END-PERFORM
           CLOSE STAYS-FILE
       
           MOVE AUDIT-DATE-ARG TO OUT-DATE
           MOVE WS-CHECKIN     TO OUT-CHECKIN
           MOVE WS-CHECKOUT    TO OUT-CHECKOUT
           MOVE WS-INHOUSE     TO OUT-INHOUSE
           MOVE WS-NOSHOW      TO OUT-NOSHOW
           MOVE WS-REVENUE     TO OUT-REVENUE
       
           OPEN OUTPUT SUMMARY-FILE
           MOVE WS-OUT-LINE TO SUMMARY-RECORD
           WRITE SUMMARY-RECORD
           CLOSE SUMMARY-FILE
       
           STOP RUN.
       
       PROCESS-STAY.
           EVALUATE RECORD-TYPE
               WHEN 'CHECKIN'
                   ADD 1 TO WS-CHECKIN
               WHEN 'CHECKOUT'
                   ADD 1 TO WS-CHECKOUT
               WHEN 'INHOUSE'
                   ADD 1 TO WS-INHOUSE
                   ADD ROOM-REV-IN  TO WS-REVENUE
                   ADD EXTRA-REV-IN TO WS-REVENUE
               WHEN 'NOSHOW'
                   ADD 1 TO WS-NOSHOW
           END-EVALUATE.
       