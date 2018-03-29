CREATE TABLE `Transactions` (
  `ID`          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `Type`        VARCHAR(11)       NOT NULL,
  `Value`       SMALLINT          NOT NULL,
  `Date`        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TerminalREF` SMALLINT UNSIGNED NULL,
  `CardREF`     VARCHAR(10)       NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT Transaction_Terminal FOREIGN KEY (TerminalREF) REFERENCES Terminals (ID),
  CONSTRAINT Transaction_Card FOREIGN KEY (CardREF) REFERENCES Cards (UID)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8;



