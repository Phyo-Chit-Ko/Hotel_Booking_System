       IDENTIFICATION DIVISION.
       PROGRAM-ID. CUSTOMERLOOKUP.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 CUSTOMER-ID PIC 9(4).

       PROCEDURE DIVISION.
      * THIS LINE READS THE ARGUMENT PASSED BY LARAVEL
           ACCEPT CUSTOMER-ID FROM COMMAND-LINE.

           EVALUATE CUSTOMER-ID
               WHEN 1
                    DISPLAY "pck"
               WHEN 2
                    DISPLAY "Mary Johnson"
               WHEN 3
                    DISPLAY "David Brown"
               WHEN OTHER
                    DISPLAY "Not Found"
           END-EVALUATE.

           STOP RUN.